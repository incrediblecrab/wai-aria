# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and GitHub Copilot CLI when working in this repository.

wai-aria is WCAG Checker, a TypeScript CLI and library that scans HTML and related web files for WCAG 2.1 accessibility violations at level A, AA or AAA. The folder and repository are named `wai-aria`, the npm package is `wai-aria-checker`, and the command it installs is `wcag-checker`; use `wai-aria-checker` with `npm view` and on the registry. The repository is public.

## Commands

```bash
npm run build                    # tsc, src/ -> dist/; bin/cli.js only requires ../dist/cli.js
npm test                         # jest via ts-jest, src/__tests__/**
npx jest src/__tests__/rules.test.ts -t '<name>'
npm run lint                     # eslint src/**/*.ts
node bin/cli.js scan . --level AA --format text   # after a build; test.html is a sample input
```

`prepublishOnly` cleans and rebuilds but does not run the tests.

## Structure

A rule has two halves that must agree. Its metadata (id, WCAG level, severity, help URL) is an entry in `WCAG_RULES` in `src/rules/wcag-rules.ts`, and its check is a class extending `BaseRule` (from `src/core/compliance-engine.ts`) in its own `src/rules/*-rule.ts` file, registered with `engine.registerRule(...)` in the constructor in `src/index.ts`. `getRulesByLevel` filters by the requested level, so a rule whose id has no `WCAG_RULES` entry never runs. `src/analyzers/html-analyzer.ts` parses files for the rules, `src/core/scanner.ts` finds them, and `src/cli.ts` holds the `scan` command; JSON and HTML output have formatters in `src/formatters/`, while text output is written inline in `cli.ts`.

## Releasing

`files` is the allowlist (`dist/`, `bin/`, `LICENSE`); `.npmignore` is a leftover. The README states the published version, so bump it with `package.json` and `CHANGELOG.md`. The release checklist is in `../README.md`.
