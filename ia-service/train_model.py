# train_model.py
import requests
import pandas as pd
import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
from datetime import datetime
import re

# --- (Funções fetch_training_data, get_round_importance e calculate_stats permanecem iguais) ---
API_URL = "http://localhost:3333/ia/train"

def fetch_training_data(url):
    print(f"Buscando dados de treinamento em {url}...")
    try:
        response = requests.get(url, timeout=120)
        response.raise_for_status()
        print("Pacote de dados recebido com sucesso!")
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"ERRO CRÍTICO: Falha ao buscar dados da API. \nDetalhes: {e}")
        return None

def get_round_importance(round_string):
    if not round_string: return 1
    round_lower = round_string.lower()
    if 'final' in round_lower: return 10
    if 'semi-final' in round_lower or 'semifinals' in round_lower: return 8
    if 'quarter-final' in round_lower or 'quarterfinals' in round_lower: return 6
    match = re.search(r'round of (\d+)', round_lower)
    if match:
        teams_left = int(match.group(1))
        if teams_left == 16: return 5
        if teams_left == 32: return 4
    if 'group stage' in round_lower or 'league phase' in round_lower: return 3
    if 'matchday' in round_lower or 'rodada' in round_lower: return 2
    return 1

def calculate_stats(matches, perspective_team_id):
    stats = {'wins': 0, 'draws': 0, 'losses': 0, 'goals_for': 0, 'goals_against': 0}
    if not matches: return stats
    for match in matches:
        is_home = match['homeTeamEspnId'] == perspective_team_id
        if is_home:
            stats['goals_for'] += match['homeScore']
            stats['goals_against'] += match['awayScore']
            if match['homeScore'] > match['awayScore']: stats['wins'] += 1
            elif match['homeScore'] < match['awayScore']: stats['losses'] += 1
            else: stats['draws'] += 1
        else:
            stats['goals_for'] += match['awayScore']
            stats['goals_against'] += match['homeScore']
            if match['awayScore'] > match['homeScore']: stats['wins'] += 1
            elif match['awayScore'] < match['homeScore']: stats['losses'] += 1
            else: stats['draws'] += 1
    return stats

# --- NOVA FUNÇÃO PARA CALCULAR O ESCORE DE FORMA PONDERADA ---
def calculate_weighted_form_score(matches, perspective_team_id):
    """
    Calcula um escore de forma baseado nos resultados e na importância dos jogos recentes.
    """
    score = 0
    if not matches:
        return 0

    for match in matches:
        importance = get_round_importance(match.get('round'))
        
        # Determina o resultado da perspectiva do time
        is_home = match['homeTeamEspnId'] == perspective_team_id
        if is_home:
            if match['homeScore'] > match['awayScore']: result = 'win'
            elif match['homeScore'] < match['awayScore']: result = 'loss'
            else: result = 'draw'
        else: # É o time visitante
            if match['awayScore'] > match['homeScore']: result = 'win'
            elif match['awayScore'] < match['homeScore']: result = 'loss'
            else: result = 'draw'

        # Atribui pontos com base no resultado e importância
        if result == 'win':
            score += (1 * importance)
        elif result == 'loss':
            score -= (1 * importance) # O "peso negativo" para derrotas
        # Empates não alteram o score, mas poderiam (ex: score += 0.1)
    
    return score

def process_data_for_training(raw_data):
    """Processa os dados brutos para criar um dataset de features (X) e targets (y)."""
    all_matches = raw_data['matches']
    h2h_data = raw_data['h2hData']
    h2h_lookup = {f"{min(h2h['team1EspnId'], h2h['team2EspnId'])}_{max(h2h['team1EspnId'], h2h['team2EspnId'])}": h2h['matches'] for h2h in h2h_data}
    features_list, targets_list, standings = [], [], {}
    print(f"Processando {len(all_matches)} jogos para extração de features...")

    for i, match in enumerate(all_matches):
        if (i + 1) % 100 == 0: print(f"  -> Processando jogo {i+1}/{len(all_matches)}...")
        
        champ_id = match['championship']['id']
        match_date_dt = datetime.fromisoformat(match['date'].replace('Z', '+00:00'))
        home_id, away_id = match['homeTeamEspnId'], match['awayTeamEspnId']

        if champ_id not in standings: standings[champ_id] = {}
        if home_id not in standings[champ_id]: standings[champ_id][home_id] = {'points': 0, 'played': 0}
        if away_id not in standings[champ_id]: standings[champ_id][away_id] = {'points': 0, 'played': 0}

        current_standings = sorted(standings[champ_id].items(), key=lambda item: item[1]['points'], reverse=True)
        ranks = {team_id: rank + 1 for rank, (team_id, _) in enumerate(current_standings)}
        home_pos, away_pos = ranks.get(home_id, len(ranks) + 1), ranks.get(away_id, len(ranks) + 1)

        past_matches = all_matches[:i]
        home_form_matches = [m for m in reversed(past_matches) if home_id in (m['homeTeamEspnId'], m['awayTeamEspnId'])][:5]
        away_form_matches = [m for m in reversed(past_matches) if away_id in (m['homeTeamEspnId'], m['awayTeamEspnId'])][:5]
        
        home_form_stats = calculate_stats(home_form_matches, home_id)
        away_form_stats = calculate_stats(away_form_matches, away_id)

        # --- CHAMADA DA NOVA FUNÇÃO ---
        home_form_score = calculate_weighted_form_score(home_form_matches, home_id)
        away_form_score = calculate_weighted_form_score(away_form_matches, away_id)

        h2h_key = f"{min(home_id, away_id)}_{max(home_id, away_id)}"
        h2h_matches_all = h2h_lookup.get(h2h_key, [])
        h2h_at_time = [m for m in h2h_matches_all if datetime.fromisoformat(m['date'].replace('Z', '+00:00')) < match_date_dt]
        h2h_stats = calculate_stats(h2h_at_time, home_id)
        
        match_importance = get_round_importance(match.get('round'))

        features = {
            'home_pos': home_pos, 'away_pos': away_pos, 'pos_diff': home_pos - away_pos,
            'home_form_wins': home_form_stats['wins'], 'home_form_draws': home_form_stats['draws'], 'home_form_losses': home_form_stats['losses'],
            'home_form_gf': home_form_stats['goals_for'], 'home_form_ga': home_form_stats['goals_against'],
            'away_form_wins': away_form_stats['wins'], 'away_form_draws': away_form_stats['draws'], 'away_form_losses': away_form_stats['losses'],
            'away_form_gf': away_form_stats['goals_for'], 'away_form_ga': away_form_stats['goals_against'],
            'h2h_home_wins': h2h_stats['wins'], 'h2h_draws': h2h_stats['draws'], 'h2h_away_wins': h2h_stats['losses'],
            'match_importance': match_importance,
            'home_form_score': home_form_score,    # <-- NOVA FEATURE
            'away_form_score': away_form_score,    # <-- NOVA FEATURE
        }
        features_list.append(features)

        if match['homeScore'] > match['awayScore']: target = 1
        elif match['awayScore'] > match['homeScore']: target = 2
        else: target = 0
        targets_list.append(target)

        if 'points' in standings[champ_id][home_id]:
             standings[champ_id][home_id]['played'] += 1
             standings[champ_id][away_id]['played'] += 1
             if target == 1: standings[champ_id][home_id]['points'] += 3
             elif target == 2: standings[champ_id][away_id]['points'] += 3
             else:
                 standings[champ_id][home_id]['points'] += 1
                 standings[champ_id][away_id]['points'] += 1

    return pd.DataFrame(features_list), np.array(targets_list)

# --- (A função 'main' permanece a mesma) ---
def main():
    raw_data = fetch_training_data(API_URL)
    if not raw_data or not raw_data['matches']: return

    X, y = process_data_for_training(raw_data)
    
    print("\nExtração de features concluída.")
    print("Estrutura das features (primeiras 5 linhas):")
    print(X.head())

    if len(X) == 0:
        print("Nenhum dado de treinamento foi gerado. Encerrando.")
        return

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    print(f"\nDataset dividido em {len(X_train)} amostras de treino e {len(X_test)} de teste.")

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("Treinando a Rede Neural (MLP) com proteção contra overfitting...")
    mlp = MLPClassifier(
        hidden_layer_sizes=(100, 50), 
        max_iter=1500,
        activation='relu', 
        solver='adam', 
        random_state=1,
        alpha=0.1,                     
        learning_rate_init=0.001,
        early_stopping=True,            
        validation_fraction=0.1,       
        n_iter_no_change=15,            
        verbose=False                   
    )
    mlp.fit(X_train_scaled, y_train)

    accuracy = mlp.score(X_test_scaled, y_test)
    print(f"\nTREINAMENTO CONCLUÍDO!")
    print(f" -> Acurácia do modelo no conjunto de teste: {accuracy:.2%}")

    joblib.dump(mlp, 'modelo_predicao_futebol.joblib')
    joblib.dump(scaler, 'scaler.joblib')
    joblib.dump(list(X.columns), 'model_columns.joblib')
    print("\nModelo, Scaler e Colunas salvos com sucesso em arquivos .joblib!")

if __name__ == "__main__":
    main()