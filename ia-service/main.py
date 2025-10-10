# Importa as bibliotecas necessárias
import joblib  # Para carregar o modelo, scaler e colunas salvos
import pandas as pd  # Para criar e manipular o DataFrame para a predição
# FastAPI é o framework para criar a API
from fastapi import FastAPI, HTTPException
# Pydantic é usado para validar a estrutura dos dados de entrada
from pydantic import BaseModel
# Para definir tipos de dados (ex: listas, valores opcionais)
from typing import List, Optional
# Para expressões regulares (usado na função de importância do round)
import re
import traceback  # Para imprimir um log de erro mais detalhado em caso de falha

# --- Modelos de Dados (Pydantic) ---
# Estas classes definem a estrutura do JSON que a API espera receber.
# Se os dados recebidos não seguirem este "contrato", o FastAPI retorna um erro automaticamente.


class Championship(BaseModel):
    id: int
    name: str


class Match(BaseModel):
    championship: Championship
    date: str
    homeTeamEspnId: int
    awayTeamEspnId: int
    homeScore: Optional[int] = None
    awayScore: Optional[int] = None
    round: Optional[str] = None


class H2HMatch(BaseModel):
    date: str
    homeTeamEspnId: int
    awayTeamEspnId: int
    homeScore: int
    awayScore: int


class HeadToHead(BaseModel):
    team1EspnId: int
    team2EspnId: int
    matches: List[H2HMatch]

# Este é o modelo principal para o corpo da requisição POST


class PredictionInput(BaseModel):
    home_team_id: int
    away_team_id: int
    matches: List[Match]
    h2h_data: List[HeadToHead]


# --- Carregamento dos Artefatos do Modelo ---
# Este bloco é executado uma única vez, quando a API é iniciada.
try:
    # Carrega o modelo de machine learning treinado
    model = joblib.load('modelo_predicao_futebol.joblib')
    # Carrega o objeto 'scaler' que foi usado para normalizar os dados de treino
    scaler = joblib.load('scaler.joblib')
    # Carrega a lista com a ordem exata das colunas (features) que o modelo espera
    model_columns = joblib.load('model_columns.joblib')
    print("Modelo, Scaler e Colunas carregados com sucesso!")
except FileNotFoundError:
    # Se algum dos arquivos não for encontrado, a aplicação para com um erro claro.
    raise RuntimeError(
        "Arquivos do modelo (.joblib) não encontrados. Execute o train_model.py primeiro.")

# Cria a instância principal da aplicação FastAPI
app = FastAPI()

# --- Funções Auxiliares de Engenharia de Features ---
# Estas funções são cópias exatas das usadas no `train_model.py` para garantir consistência.


def get_round_importance(round_string):
    """Atribui um peso numérico à partida com base no texto do campo 'round'."""
    if not round_string:
        return 1
    round_lower = round_string.lower()
    if 'final' in round_lower:
        return 10
    if 'semi-final' in round_lower or 'semifinals' in round_lower:
        return 8
    if 'quarter-final' in round_lower or 'quarterfinals' in round_lower:
        return 6
    match = re.search(r'round of (\d+)', round_lower)
    if match:
        teams_left = int(match.group(1))
        if teams_left == 16:
            return 5
        if teams_left == 32:
            return 4
    if 'group stage' in round_lower or 'league phase' in round_lower:
        return 3
    if 'matchday' in round_lower or 'rodada' in round_lower:
        return 2
    return 1


def calculate_stats(matches, perspective_team_id):
    """Calcula estatísticas básicas (Vitórias, Empates, Derrotas, Gols Pró, Gols Contra) de uma lista de jogos."""
    stats = {'wins': 0, 'draws': 0, 'losses': 0,
             'goals_for': 0, 'goals_against': 0}
    if not matches:
        return stats
    for match in matches:
        is_home = match.homeTeamEspnId == perspective_team_id
        if is_home:
            if match.homeScore is not None and match.awayScore is not None:
                stats['goals_for'] += match.homeScore
                stats['goals_against'] += match.awayScore
                if match.homeScore > match.awayScore:
                    stats['wins'] += 1
                elif match.homeScore < match.awayScore:
                    stats['losses'] += 1
                else:
                    stats['draws'] += 1
        else:
            if match.awayScore is not None and match.homeScore is not None:
                stats['goals_for'] += match.awayScore
                stats['goals_against'] += match.homeScore
                if match.awayScore > match.homeScore:
                    stats['wins'] += 1
                elif match.awayScore < match.homeScore:
                    stats['losses'] += 1
                else:
                    stats['draws'] += 1
    return stats


def calculate_weighted_form_score(matches, perspective_team_id):
    """Calcula um escore de forma ponderado apenas pela importância da partida."""
    score = 0
    if not matches:
        return 0
    for match in matches:
        if match.homeScore is None or match.awayScore is None:
            continue
        importance = get_round_importance(match.round)
        is_home = match.homeTeamEspnId == perspective_team_id
        result = ''
        if is_home:
            if match.homeScore > match.awayScore:
                result = 'win'
            elif match.homeScore < match.awayScore:
                result = 'loss'
        else:
            if match.awayScore > match.homeScore:
                result = 'win'
            elif match.awayScore < match.homeScore:
                result = 'loss'
        if result == 'win':
            score += (1 * importance)
        elif result == 'loss':
            score -= (1 * importance)
    return score


def engineer_features_for_prediction(data: PredictionInput):
    """
    Função principal que recebe o pacote de contexto do backend Node.js e o transforma
    em um dicionário de features numéricas para o modelo.
    """
    home_id = data.home_team_id
    away_id = data.away_team_id
    all_matches = data.matches
    h2h_data = data.h2h_data

    # 1. Reconstrói a(s) tabela(s) de classificação com os jogos históricos recebidos
    standings = {}
    for match in all_matches:
        champ_id = match.championship.id
        if champ_id not in standings:
            standings[champ_id] = {}
        h_id, a_id = match.homeTeamEspnId, match.awayTeamEspnId
        if h_id not in standings[champ_id]:
            standings[champ_id][h_id] = {'points': 0}
        if a_id not in standings[champ_id]:
            standings[champ_id][a_id] = {'points': 0}
        if match.homeScore is not None and match.awayScore is not None:
            if match.homeScore > match.awayScore:
                standings[champ_id][h_id]['points'] += 3
            elif match.awayScore > match.homeScore:
                standings[champ_id][a_id]['points'] += 3
            else:
                standings[champ_id][h_id]['points'] += 1
                standings[champ_id][a_id]['points'] += 1

    # 2. Encontra a posição atual dos times no campeonato relevante
    try:
        # Encontra o último jogo de um dos times para descobrir o ID do campeonato atual
        relevant_matches = [m for m in all_matches if home_id in (
            m.homeTeamEspnId, m.awayTeamEspnId) or away_id in (m.homeTeamEspnId, m.awayTeamEspnId)]
        current_champ_id = sorted(
            relevant_matches, key=lambda x: x.date)[-1].championship.id
        # Ordena a tabela de classificação para obter o ranking
        current_standings_list = sorted(standings[current_champ_id].items(
        ), key=lambda item: item[1]['points'], reverse=True)
        ranks = {team_id: rank + 1 for rank,
                 (team_id, _) in enumerate(current_standings_list)}
        home_pos = ranks.get(home_id, len(ranks) + 1)
        away_pos = ranks.get(away_id, len(ranks) + 1)
    except (IndexError, KeyError):
        # Se houver erro (ex: time novo sem jogos), usa uma posição neutra como padrão
        home_pos, away_pos = 10, 10

    # 3. Calcula a forma recente (últimos 5 jogos)
    home_form_matches = sorted([m for m in all_matches if home_id in (
        m.homeTeamEspnId, m.awayTeamEspnId)], key=lambda x: x.date, reverse=True)[:5]
    away_form_matches = sorted([m for m in all_matches if away_id in (
        m.homeTeamEspnId, m.awayTeamEspnId)], key=lambda x: x.date, reverse=True)[:5]

    home_form_stats = calculate_stats(home_form_matches, home_id)
    away_form_stats = calculate_stats(away_form_matches, away_id)
    home_form_score = calculate_weighted_form_score(home_form_matches, home_id)
    away_form_score = calculate_weighted_form_score(away_form_matches, away_id)

    # 4. Calcula o histórico de confronto direto (H2H)
    h2h_record = next((h for h in h2h_data if home_id in (
        h.team1EspnId, h.team2EspnId) and away_id in (h.team1EspnId, h.team2EspnId)), None)
    h2h_stats = calculate_stats(
        h2h_record.matches if h2h_record else [], home_id)

    # 5. Monta o dicionário de features, garantindo que todas as chaves esperadas pelo modelo existam
    features = {
        'home_pos': home_pos,
        'away_pos': away_pos,
        'pos_diff': home_pos - away_pos,
        'home_form_wins': home_form_stats['wins'],
        'home_form_draws': home_form_stats['draws'],
        'home_form_losses': home_form_stats['losses'],
        'home_form_gf': home_form_stats['goals_for'],
        'home_form_ga': home_form_stats['goals_against'],
        'away_form_wins': away_form_stats['wins'],
        'away_form_draws': away_form_stats['draws'],
        'away_form_losses': away_form_stats['losses'],
        'away_form_gf': away_form_stats['goals_for'],
        'away_form_ga': away_form_stats['goals_against'],
        'h2h_home_wins': h2h_stats['wins'],
        'h2h_draws': h2h_stats['draws'],
        'h2h_away_wins': h2h_stats['losses'],
        # Define um valor padrão de importância para um jogo futuro de liga
        'match_importance': 2,
        'home_form_score': home_form_score,
        'away_form_score': away_form_score,
        # Adiciona chaves para as features mais novas, mesmo que não as calculemos aqui,
        # para manter a consistência com o modelo treinado. Elas receberão o valor 0.
        'home_form_gd': home_form_stats['goals_for'] - home_form_stats['goals_against'],
        'away_form_gd': away_form_stats['goals_for'] - away_form_stats['goals_against'],
        'home_avg_opponent_rank': 10,  # Valor padrão
        'away_avg_opponent_rank': 10,  # Valor padrão
        'form_score_diff': home_form_score - away_form_score,
        'avg_opponent_rank_diff': 0  # Valor padrão
    }
    return features

# --- Endpoint da API ---
# Este é o ponto de entrada que o backend Node.js chama


@app.post("/predict")
def predict(data: PredictionInput):
    """Recebe os dados do jogo, orquestra a engenharia de features e retorna a predição do modelo."""
    try:
        # 1. Transforma os dados brutos em um dicionário de features numéricas
        features_dict = engineer_features_for_prediction(data)

        # 2. Cria um DataFrame do Pandas na ordem exata de colunas que o modelo espera
        df = pd.DataFrame([features_dict], columns=model_columns)

        # 3. Adiciona uma "rede de segurança" para substituir qualquer valor NaN (não numérico) por 0
        df.fillna(0, inplace=True)

        # 4. Aplica a normalização nos dados de entrada, usando o mesmo 'scaler' do treinamento
        scaled_features = scaler.transform(df)

        # 5. Usa o modelo carregado para fazer a predição
        prediction_code = model.predict(scaled_features)[
            0]  # Resultado final (0, 1 ou 2)
        prediction_proba = model.predict_proba(
            scaled_features)[0]  # Probabilidades de cada resultado

        # 6. Formata o JSON de resposta com base no código da predição
        if int(prediction_code) == 1:
            predicao_texto, placar_predito, home_s, away_s = "Vitória do Time da Casa", "2x1", 2, 1
        elif int(prediction_code) == 2:
            predicao_texto, placar_predito, home_s, away_s = "Vitória do Time Visitante", "1x2", 1, 2
        else:
            predicao_texto, placar_predito, home_s, away_s = "Empate", "1x1", 1, 1

        # 7. Retorna a resposta final para o backend Node.js
        return {
            "predicao_texto": predicao_texto,
            "placar_predito": placar_predito,
            "home_score_predito": home_s,
            "away_score_predito": away_s,
            "codigo_predicao": int(prediction_code),
            "probabilidades": {
                "empate": round(prediction_proba[0], 4),
                "vitoria_casa": round(prediction_proba[1], 4),
                "vitoria_visitante": round(prediction_proba[2], 4)
            }
        }
    except Exception as e:
        # Em caso de qualquer erro durante o processo, imprime o erro detalhado no log
        # e retorna um erro 500 para o cliente.
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500, detail=f"Ocorreu um erro interno na engenharia de features ou predição: {e}")
