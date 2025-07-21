# Changelog - Modifications des Calculs Fiscaux SCOP

## Version 2.0.0 - Amélioration des Calculs Fiscaux

### Modifications Majeures

#### 1. Traitement de la CET dans les Calculs Fiscaux
- **Avant** : La CET était traitée comme une charge externe au calcul de l'IS
- **Après** : La CET est intégrée comme charge d'impôt dans la base imposable pour les SCOP
- **Impact** : Permet une comparaison équitable entre le régime classique et le régime SCOP

#### 2. Base de Calcul pour la Répartition du Résultat
- **Avant** : La répartition (participation, réserves, dividendes) s'appliquait sur le résultat fiscal
- **Après** : La répartition s'applique sur le résultat net après impôts
- **Justification** : Conforme aux pratiques comptables SCOP réelles

#### 3. Calcul des Déductions Fiscales
- **Avant** : Les déductions étaient calculées sur le résultat fiscal
- **Après** : Les déductions sont calculées sur la base imposable incluant la charge CET théorique
- **Avantage** : Optimise l'effet fiscal des déductions SCOP

### Formules Modifiées

#### Scénario AVEC SCOP :

1. **Base imposable avant déductions** :
   ```
   Base = Résultat Fiscal + CET
   ```

2. **Déductions fiscales** :
   ```
   Déduction Participation = Base × (% Participation / 100)
   Déduction Réserves = Base × min(% Réserves, % Participation) / 100
   ```

3. **Base imposable finale** :
   ```
   Base IS = Base - Déduction Participation - Déduction Réserves
   ```

4. **Résultat net pour répartition** :
   ```
   Résultat Net = Résultat Fiscal - IS calculé
   ```

5. **Répartition du résultat net** :
   ```
   Participation = Résultat Net × (% Participation / 100)
   Réserves = Résultat Net × (% Réserves / 100)
   Dividendes = Résultat Net × (% Dividendes / 100)
   ```

### Impact sur l'Interface Utilisateur

- **Aucune modification visuelle** : L'interface reste identique
- **Nouvelle section** : "Traitement Fiscal SCOP" dans le tableau de résultats
- **Tooltips mis à jour** : Précision que la répartition s'applique sur le résultat net
- **Note explicative** : Ajout d'une note dans la section d'affectation du résultat

### Validation des Calculs

Les nouveaux calculs respectent :
- Les règles fiscales SCOP en vigueur
- La cohérence comptable entre les différents postes
- L'équilibre de la répartition (total = 100%)
- La logique d'optimisation fiscale des SCOP

## Version 2.1.0 - Correction Terminologie Comptable

### Modifications Apportées

#### 1. Correction du Calcul du Résultat Net
- **Avant** : Résultat Net = Résultat Fiscal - IS - CET
- **Après** : Résultat Net = Résultat Fiscal - IS (seul l'IS est déduit)
- **Justification** : Conformité aux normes comptables françaises

#### 2. Mise à Jour de la Terminologie
- **Avant** : "Résultat Net Après Impôts"
- **Après** : "Résultat Net Après IS"
- **Raison** : Précision terminologique - seul l'IS impacte le résultat net

#### 3. Traitement de la CET
- La CET reste affichée comme charge fiscale distincte
- Elle n'est plus déduite dans le calcul du résultat net
- Conforme au traitement comptable français des impôts locaux

### Compatibilité

- **Rétrocompatible** : Les paramètres d'entrée restent identiques
- **Export PDF** : Fonctionne avec les nouveaux calculs
- **Responsive design** : Préservé intégralement