# Workflow de passation client — Vercel & GitHub

**Auteur** VÆON Studio
**Date** 2026-05-19
**Destinataires** Théo, Hedi, Maxime
**Statut** En vigueur depuis le commit `ce17361`

---

## 1. Positionnement de référence

VÆON est un **Studio**, pas une Agence. La différence opérationnelle se joue à la livraison :

| Agence classique (WordPress & co) | VÆON Studio |
|---|---|
| Garde le hosting au nom de l'agence | Hosting créé au nom du client |
| Récurrence mensuelle obligatoire (60-80 €/mois) | Zéro abonnement chez VÆON |
| Maintenance forcée | Évolutions à la demande sur devis |
| Client dépendant techniquement | Client 100 % autonome dès J+0 |
| Lock-in implicite | Aucun lock-in, accès remis au client |

**La promesse écrite sur le site (tarifs.html, process.html, métiers) :**

> À la livraison, votre site est 100 % à vous. Compte hosting à votre nom, code source en archive, domaine chez votre registrar. VÆON se déconnecte. Pas de lock-in, pas d'abonnement.

Toute dérive opérationnelle qui contredit cette promesse abîme le positionnement.

---

## 2. Workflow Vercel — création du compte client

### 2.1 Au lancement du projet (J-14 environ)

**Côté client** — on demande :
- Un email pro (idéalement `contact@<son-domaine>.fr`, sinon adresse perso pro)
- Confirmation qu'il accepte qu'on crée un compte Vercel à son nom

**Côté VÆON** :
1. Ouvrir **navigation privée** (pour ne pas polluer la session VÆON)
2. Aller sur `https://vercel.com/signup`
3. Créer le compte avec l'email du client + un mot de passe provisoire généré (1Password recommandé) au format `VAEON-<client>-<YYYY-MM-DD>!`
4. Choisir **plan Hobby** (gratuit)
5. **NE PAS activer le 2FA** pendant le dev (sinon on ne peut plus se connecter sans le client). Le 2FA sera activé par le client à la passation.
6. Stocker les credentials dans 1Password sous le tag `vaeon-client-<nom>` (vaeon-studio shared vault)

### 2.2 Pendant le projet

- VÆON est seul Owner du projet Vercel
- Les déploiements se font via `vercel link --project <nom>` + `vercel deploy`
- Le domaine final est branché sur le compte Vercel client (pas sur le team VAEON)
- **Ne JAMAIS** déployer un projet client sur l'équipe Vercel `vaeon-studio` — risque de confusion et de migration douloureuse

### 2.3 À la livraison (J-Day)

**1. Email de passation envoyé au client** (voir template §5)

**2. Côté VÆON, exécuter dans cet ordre :**
1. Vérifier que tous les déploiements sont OK et que le domaine pointe bien
2. Sortir des sessions actives sur le compte Vercel client :
   - Aller dans `Settings → Sessions → Sign out all sessions`
3. Supprimer les credentials de 1Password (archive en `<nom>-archived-YYYY-MM-DD`)
4. Cocher la case "passation faite" dans le CRM avec date J+30 (fin du support inclus)

**3. Côté client, on lui demande de :**
1. Cliquer sur le lien de reset password Vercel
2. Définir son propre mot de passe
3. **Activer le 2FA immédiatement** (Settings → Security → Two-Factor Authentication)
4. Confirmer qu'il a bien accès au dashboard

**4. À J+7 post-livraison :**
- Vérifier qu'aucune session VAEON n'est restée connectée (Vercel → Settings → Sessions)
- Si oui, sign out immédiatement

---

## 3. Workflow GitHub — Option B (archive + ZIP)

### 3.1 Pendant le projet
- Repo privé créé sur `github.com/vaeon-studio/<client>-site`
- Branche `main` = production
- VÆON est seul collaborateur

### 3.2 À la livraison

**Côté VÆON :**
1. `git push origin main` (s'assurer que tout est commit)
2. Export du code en archive ZIP :
   ```bash
   git archive --format=zip --output=<client>-site-source-YYYY-MM-DD.zip HEAD
   ```
3. Joindre le ZIP à l'email de passation
4. **Archiver le repo GitHub** :
   - Aller sur `Settings → General → Archive this repository`
   - Le repo devient read-only mais reste accessible 12 mois pour ré-ouverture en cas de besoin
5. Noter dans le CRM la date d'archivage + la date prévue de suppression (J+365)

**Côté client :**
- Reçoit le ZIP par email
- Aucun GitHub à manipuler par défaut
- Si le client demande explicitement Git versionné (rare, mais possible si dev interne) :
  - Transfert du repo vers son compte/orga GitHub via `Settings → Transfer ownership`
  - Le repo quitte vaeon-studio et passe chez le client
  - Facturation possible en upsell (50 € forfait)

### 3.3 Au bout de 12 mois sans contact client
- Suppression définitive du repo GitHub archivé
- Notifier le client par email 30 jours avant suppression

---

## 4. Checklist de passation (à cocher en Notion)

```
□ Compte Vercel à nom du client créé · Hobby (gratuit)
□ Site déployé sur https://<client>.vercel.app
□ Domaine custom <client>.fr branché · DNS configuré chez <registrar>
□ SSL automatique actif (vérifier https://)
□ Fiche Google Business mise à jour + connectée au site
□ Plausible/PostHog créé sur compte client (si Standard/Premium)
□ Archive ZIP du code source générée
□ Repo GitHub archivé sur vaeon-studio
□ Email de passation envoyé (voir template §5)
□ Credentials Vercel 1Password archivés
□ Sessions VAEON déconnectées du compte Vercel client
□ Date fin support 30j notée dans CRM
□ Suivi J+7 programmé (vérif sessions, support questions)
```

---

## 5. Template email de passation

```
Objet : Votre site est en ligne — passation et accès

Bonjour [Prénom client],

Votre site [domaine.fr] est officiellement en ligne. Voici les accès et
documents que je vous remets pour que vous soyez 100 % autonome.

────────────────────────────────────────────
🌐 HÉBERGEMENT VERCEL (à votre nom)
────────────────────────────────────────────
Login : [email-client]
Mot de passe provisoire : [mdp-provisoire]
URL : https://vercel.com/login

→ Première chose à faire : cliquez sur "Forgot password" et définissez
   votre propre mot de passe.
→ Activez ensuite le 2FA : Settings → Security → Two-Factor Authentication.

Plan : Hobby (gratuit). Suffisant pour un trafic TPE classique.
Si votre site connaît un buzz important, vous pourrez upgrader vers Pro
à 20 €/mois directement depuis votre compte (sans passer par nous).

────────────────────────────────────────────
🌍 NOM DE DOMAINE
────────────────────────────────────────────
Registrar : [OVH / Gandi / Cloudflare / autre]
Domaine : [domaine.fr]

Géré directement sur votre compte registrar.

────────────────────────────────────────────
💻 CODE SOURCE
────────────────────────────────────────────
Archive ZIP jointe à cet email : [client-site-source-YYYY-MM-DD.zip]

Le code vous appartient à 100 %. Vous pouvez :
- Le confier à un autre studio si besoin
- L'héberger ailleurs (Netlify, Cloudflare Pages, OVH...)
- Le modifier vous-même si vous avez un dev en interne

────────────────────────────────────────────
📊 ANALYTICS (si Standard/Premium)
────────────────────────────────────────────
Compte Plausible/PostHog créé à votre email.
Login : même email que ci-dessus
Lien : [URL dashboard]

────────────────────────────────────────────
📞 SUPPORT POST-LIVRAISON
────────────────────────────────────────────
30 jours de support inclus pour les ajustements et bugs résiduels.
Date de fin : [date J+30].

Au-delà, nous restons joignables pour des évolutions ponctuelles,
facturées sur devis (pas d'abonnement, pas de récurrence).

────────────────────────────────────────────
📄 PETITE DOC
────────────────────────────────────────────
PDF joint : "Comment modifier un texte sur votre site" (1 page).

────────────────────────────────────────────

Une question ? Répondez à cet email ou contactez-moi directement à
[email VAEON]. Bonne mise en ligne.

[Signature]
```

---

## 6. Cas particuliers

### 6.1 Client qui veut absolument que VAEON garde la main
- **Refuser poliment.** Expliquer que c'est notre positionnement (Studio dissocié), pas un caprice.
- Proposer une alternative : VAEON reste collaborateur sur le projet Vercel client (lecture seule) pour faciliter le support ponctuel. Le client reste Owner unique.

### 6.2 Client qui demande "et si Vercel disparaît ?"
- Réponse : le code source est à vous (ZIP livré). Vous pouvez déployer ailleurs en 30 minutes (Netlify, Cloudflare Pages, OVH static, etc.). Vous n'êtes pas verrouillés.
- Pour le rassurer : Vercel a 100M$ de funding, Next.js sponsor officiel, peu probable de disparaître à court terme. Mais l'argument "code à vous" reste valable même en pire scénario.

### 6.3 Client qui veut du "vrai" support continu
- Lui vendre du **temps** au cas par cas (taux horaire VAEON), pas du forfait
- Justification éditoriale : "Vous payez ce dont vous avez vraiment besoin, quand vous en avez besoin"
- Refuser tout abonnement mensuel — c'est le mur de Chesterton du positioning Studio

### 6.4 Client TPE non-tech qui panique à l'idée de gérer un compte Vercel
- Lui montrer que le dashboard Vercel est utilisable sans aucune compétence tech
- Lui envoyer un screencast Loom de 2 min sur le dashboard
- En dernier recours : proposer une session d'accompagnement payante (30 min visio, 50 €) pour faire la passation en direct

### 6.5 Site qui dépasse le free tier Vercel Hobby
- Vercel envoie un email automatique au client (pas à nous)
- Le client upgrade lui-même vers Pro (20 €/mois) ou bascule vers un autre hébergeur
- VAEON intervient uniquement si le client demande explicitement de l'aide (sur devis)

---

## 7. Mentions légales VAEON.FR

Pour notre propre site (`vaeon.fr`), l'hébergeur est `Vercel Inc.` (mentions-legales.html à jour). Les serveurs sont en Europe (région `fra1` Paris/Francfort) pour RGPD. Pour les sites clients, l'hébergeur sera Vercel **au nom du client** — pas notre responsabilité RGPD juridique, ils sont leur propre responsable du traitement.

---

*Document vivant. À amender au fil des projets clients. Toute modification → commit dédié.*
