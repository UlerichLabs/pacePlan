# ADR 005 — React Native em vez de Capacitor para mobile

**Status:** aceito — implementação futura
**Data:** 2026-04-08
**Autores:** UlerichLabs

## Contexto

O PacePlan é atualmente uma PWA. A intenção é publicar nas lojas
(App Store e Google Play) e integrar com Samsung Health / Health Connect
para importar dados do Galaxy Watch do usuário.

Duas opções avaliadas para mobile: Capacitor (empacota a PWA como app
nativo) e React Native (reescreve a camada visual com primitivas nativas).

O contexto decisivo: o objetivo do projeto é ser vitrine de augmented
engineering. A stack precisa ser defensável publicamente.

## Decisão

Adotar React Native + Expo para o app mobile, a ser implementado
após a conclusão do Épico 08 e estabilização da PWA.

A camada visual será reescrita com primitivas RN (View, Text, Pressable).
Todo o resto — packages/utils, packages/api-client, packages/ui-logic,
packages/types — é reaproveitado sem modificação (ver ADR 004).

Estilização mobile via NativeWind — Tailwind para React Native,
compartilhando o mesmo tailwind.config.ts da web.

## Alternativas consideradas

Capacitor: empacota a PWA como app nativo. Rápido de implementar,
CSS funciona sem alteração. Mas a experiência é perceptivelmente
diferente de um app nativo — scroll, gestos e animações não têm
a fluidez nativa. Para um app de treino usado diariamente, isso importa.
Descartado por qualidade de experiência.

PWA permanente: sem acesso ao Health Connect (API Android nativa),
sem publicação nas lojas de forma oficial. Descartado.

## Consequências

+ Experiência nativa real — scroll, gestos, animações fluidos
+ Acesso ao Health Connect via biblioteca nativa
+ Publicação nas lojas (App Store, Google Play)
+ NativeWind: mesmo design system web e mobile
+ packages/ compartilhados: zero reescrita de lógica (ver ADR 004)
+ Vitrine: stack profissional, defensável publicamente
- Reescrita da camada visual (apps/web/src/components → apps/mobile)
- Aprendizado de primitivas React Native
- Implementação posterior — não bloqueia o MVP web
