# ADR 001 — Tailwind CSS v4 em vez de CSS inline

**Status:** aceito
**Data:** 2026-04-08
**Autores:** UlerichLabs

## Contexto

O frontend do PacePlan foi construído inicialmente com CSS inline
via style={{}} e CSS Custom Properties. Essa abordagem funcionou para
a primeira fase de desenvolvimento mas criou três limitações concretas:

1. Inline styles não suportam media queries — impossível implementar
   o layout responsivo (sidebar desktop / bottom bar mobile) de forma
   consistente sem arquivos CSS separados
2. Inline styles não suportam pseudo-classes — :hover, :focus-visible
   e :active exigem classes CSS, o que criou inconsistência no projeto
3. Ausência de design system unificado — cada componente recriava
   os mesmos valores de espaçamento e cor sem garantia de consistência

O projeto tem objetivo explícito de ser vitrine de augmented engineering.
Inconsistência no CSS é o primeiro sinal que um dev experiente nota
em code review.

## Decisão

Adotar Tailwind CSS v4 como sistema de estilização padrão.

- Design tokens definidos via @theme em globals.css
- Classes utilitárias para toda estilização estática
- style={{}} permitido apenas para valores calculados em runtime
- Arbitrary values ([#hex], [valor]) proibidos — apenas tokens do @theme
- CSS Modules avaliado e descartado (ver alternativas abaixo)

## Alternativas consideradas

CSS Modules: resolve media queries e pseudo-classes mas não oferece
design system — cada arquivo de módulo recria tokens manualmente.
Descartado por não resolver a inconsistência de design.

CSS-in-JS (Emotion, styled-components): overhead de runtime,
não funciona no React Native. Descartado.

Manter CSS inline: não resolve media queries nem pseudo-classes.
Descartado.

## Consequências

+ Media queries via sm:, md:, lg: — layout responsivo nativo
+ Pseudo-classes via hover:, focus-visible:, active:
+ Design system unificado em tailwind.config.ts
+ NativeWind (Tailwind para React Native) compartilha a mesma config
+ Ecossistema React atual converge em Tailwind — legível por qualquer dev
+ Vitrine: decisão documentada e justificada profissionalmente
- Migração necessária dos componentes existentes (CSS inline → classes)
- Curva de aprendizado para arbitrary values e v4 syntax
