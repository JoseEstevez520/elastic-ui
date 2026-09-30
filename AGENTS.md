# AGENTS.md

## Commits

- Do not add `Co-Authored-By` or any other AI/agent attribution line to commit messages.
- Do not add "Generated with ..." signatures to commits or pull requests.

## Language

- Everything in the project is written in English: code, comments, docs and commit messages.
- Chat with the user in Spanish.

## Workflow

- This is a learning project. Discuss and plan with the user before creating files, installing dependencies or writing code.
- Only write code when the user explicitly asks for it.
- This is an npm workspace: the library lives in `packages/elastic-ui` and the site in `site`. Root scripts delegate to them.
- Follow the decisions and code rules in `packages/elastic-ui/DECISIONS.md`. Keep the code clean.
- When using the library (stories, examples, other projects), follow `packages/elastic-ui/USAGE.md`.
