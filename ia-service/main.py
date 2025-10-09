import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import re
import traceback

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

class PredictionInput(BaseModel):
    home_team_id: int
    away_team_id: int
    matches: List[Match]
    h2h_data: List[HeadToHead]

try:
    model = joblib.load('modelo_predicao_futebol.joblib')
    scaler = joblib.load('scaler.joblib')
    model_columns = joblib.load('model_columns.joblib')
    print("Modelo, Scaler e Colunas carregados com sucesso!")
except FileNotFoundError:
    raise RuntimeError("Arquivos do modelo (.joblib) não encontrados. Execute o train_model.py primeiro.")

app = FastAPI()

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
        is_home = match.homeTeamEspnId == perspective_team_id
        if is_home:
            if match.homeScore is not None and match.awayScore is not None:
                stats['goals_for'] += match.homeScore
                stats['goals_against'] += match.awayScore
                if match.homeScore > match.awayScore: stats['wins'] += 1
                elif match.homeScore < match.awayScore: stats['losses'] += 1
                else: stats['draws'] += 1
        else:
            if match.awayScore is not None and match.homeScore is not None:
                stats['goals_for'] += match.awayScore
                stats['goals_against'] += match.homeScore
                if match.awayScore > match.homeScore: stats['wins'] += 1
                elif match.awayScore < match.homeScore: stats['losses'] += 1
                else: stats['draws'] += 1
    return stats

def calculate_weighted_form_score(matches, perspective_team_id):
    score = 0
    if not matches: return 0
    for match in matches:
        if match.homeScore is None or match.awayScore is None: continue
        importance = get_round_importance(match.round)
        is_home = match.homeTeamEspnId == perspective_team_id
        result = ''
        if is_home:
            if match.homeScore > match.awayScore: result = 'win'
            elif match.homeScore < match.awayScore: result = 'loss'
        else:
            if match.awayScore > match.homeScore: result = 'win'
            elif match.awayScore < match.homeScore: result = 'loss'
        if result == 'win': score += (1 * importance)
        elif result == 'loss': score -= (1 * importance)
    return score

def engineer_features_for_prediction(data: PredictionInput):
    home_id = data.home_team_id
    away_id = data.away_team_id
    all_matches = data.matches
    h2h_data = data.h2h_data
    
    standings = {}
    for match in all_matches:
        champ_id = match.championship.id
        if champ_id not in standings: standings[champ_id] = {}
        h_id, a_id = match.homeTeamEspnId, match.awayTeamEspnId
        if h_id not in standings[champ_id]: standings[champ_id][h_id] = {'points': 0}
        if a_id not in standings[champ_id]: standings[champ_id][a_id] = {'points': 0}
        if match.homeScore is not None and match.awayScore is not None:
            if match.homeScore > match.awayScore: standings[champ_id][h_id]['points'] += 3
            elif match.awayScore > match.homeScore: standings[champ_id][a_id]['points'] += 3
            else:
                standings[champ_id][h_id]['points'] += 1
                standings[champ_id][a_id]['points'] += 1
    
    try:
        relevant_matches = [m for m in all_matches if home_id in (m.homeTeamEspnId, m.awayTeamEspnId) or away_id in (m.homeTeamEspnId, m.awayTeamEspnId)]
        current_champ_id = sorted(relevant_matches, key=lambda x: x.date)[-1].championship.id
        current_standings_list = sorted(standings[current_champ_id].items(), key=lambda item: item[1]['points'], reverse=True)
        ranks = {team_id: rank + 1 for rank, (team_id, _) in enumerate(current_standings_list)}
        home_pos = ranks.get(home_id, len(ranks) + 1)
        away_pos = ranks.get(away_id, len(ranks) + 1)
    except (IndexError, KeyError):
        home_pos, away_pos = 10, 10 

    home_form_matches = sorted([m for m in all_matches if home_id in (m.homeTeamEspnId, m.awayTeamEspnId)], key=lambda x: x.date, reverse=True)[:5]
    away_form_matches = sorted([m for m in all_matches if away_id in (m.homeTeamEspnId, m.awayTeamEspnId)], key=lambda x: x.date, reverse=True)[:5]

    home_form_stats = calculate_stats(home_form_matches, home_id)
    away_form_stats = calculate_stats(away_form_matches, away_id)
    home_form_score = calculate_weighted_form_score(home_form_matches, home_id)
    away_form_score = calculate_weighted_form_score(away_form_matches, away_id)

    h2h_record = next((h for h in h2h_data if home_id in (h.team1EspnId, h.team2EspnId) and away_id in (h.team1EspnId, h.team2EspnId)), None)
    h2h_stats = calculate_stats(h2h_record.matches if h2h_record else [], home_id)
    
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
        'match_importance': 2,
        'home_form_score': home_form_score,
        'away_form_score': away_form_score,
    }
    return features

@app.post("/predict")
def predict(data: PredictionInput):
    try:
        features_dict = engineer_features_for_prediction(data)
        df = pd.DataFrame([features_dict], columns=model_columns)
        df.fillna(0, inplace=True)
        scaled_features = scaler.transform(df)
        prediction_code = model.predict(scaled_features)[0]
        prediction_proba = model.predict_proba(scaled_features)[0]

        if int(prediction_code) == 1:
            predicao_texto, placar_predito, home_s, away_s = "Vitória do Time da Casa", "2x1", 2, 1
        elif int(prediction_code) == 2:
            predicao_texto, placar_predito, home_s, away_s = "Vitória do Time Visitante", "1x2", 1, 2
        else:
            predicao_texto, placar_predito, home_s, away_s = "Empate", "1x1", 1, 1

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
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ocorreu um erro interno na engenharia de features ou predição: {e}")