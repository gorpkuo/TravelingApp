# Agent Coding Rules

## 1. Mandatory First Step

For every project, the agent must read `Agent.md` before taking any action.

The agent must treat this file as the primary operating rulebook for the project. If there are project-specific instructions, architecture notes, or workflow constraints in this file, they must take priority over assumptions.

---

## 2. Understand the Project Architecture First

Before modifying code, the agent must first understand the complete project structure.

The agent must:

1. Inspect the project directory structure.
2. Identify the major architectural boundaries.
3. Understand how the project is divided into modules, layers, packages, services, or components.
4. Avoid jumping directly into implementation before understanding the overall structure.

---

## 3. Build a Layered Architecture View

After reviewing the project structure, the agent must describe the project using a layered architecture model.

The agent must output:

1. A concise explanation of the main layers.
2. The responsibility of each layer.
3. The relationship between layers.
4. A layered architecture diagram file.

The diagram should focus on the main structure only. It should not include unnecessary implementation details.

Suggested diagram formats:

- `architecture.md`
- `architecture.mmd`
- `architecture.svg`
- `architecture.png`

When possible, prefer Mermaid format for easy review and maintenance.

---

## 4. Identify Main Topics Only

The agent must list the main development topics before starting implementation.

A topic means a major work area, such as:

- Authentication
- Data model
- API layer
- UI flow
- Error handling
- Test coverage
- Configuration
- Deployment logic

The agent must only list the main backbone topics.

The agent must not expand into detailed discussion, side topics, optional improvements, or unrelated suggestions unless explicitly requested.

---

## 5. Work on One Topic at a Time

The agent must execute only one topic at a time.

Before starting work on a topic, the agent must clearly state:

1. The topic being worked on.
2. The goal of the topic.
3. The files that may be changed.
4. The files that may be created.
5. Any files that may need to be reviewed but not modified.

The agent must not modify files outside the listed scope unless it first explains why the additional file is required.

---

## 6. No Coding Until Explicit Approval

The agent must not start coding immediately.

The agent may inspect, analyze, summarize, and plan.

The agent may not edit, create, delete, refactor, or generate implementation code until the user explicitly says:

> gogogo

Only after receiving this exact approval may the agent begin coding.

---

## 7. Required Workflow

The agent must follow this workflow for every project:

1. Read `Agent.md`.
2. Inspect the project structure.
3. Identify the architecture boundaries.
4. Produce a layered architecture summary.
5. Output a layered architecture diagram file.
6. List the main topics.
7. Select only one topic to work on.
8. Before execution, list all files that may be changed or created.
9. Wait for the user to say `gogogo`.
10. Start coding only after approval.

---

## 8. Communication Style

The agent must communicate clearly and concisely.

The agent should:

- Focus on the main structure.
- Avoid unnecessary explanations.
- Avoid discussing unrelated improvements.
- Ask questions only when required to proceed safely.
- Be explicit about what will be changed before changing it.

Additional communication and execution preferences:

- Reply in Traditional Chinese and keep responses short.
- Do not explain the process, repeat the request, or give long summaries unless asked.
- Work only on the current request.
- The agent may fix small issues within the same topic if they block verification.
- Unless there is risk, do not present a plan first. Execute directly.

---

## 9. Change Discipline

When coding is approved, the agent must:

1. Keep changes limited to the approved topic.
2. Avoid broad refactoring unless explicitly requested.
3. Preserve existing project conventions.
4. Prefer small, reviewable changes.
5. Explain any deviation from the original file-change list before making that deviation.

---

## 10. Completion Report

After completing an approved coding task, the agent must report:

1. What was changed.
2. Which files were changed or created.
3. What was not changed.
4. Any follow-up topics that remain.

The report should remain focused on the current topic only.

---

## 11. Windows Execution Rule (.bat First)

For this project, repeatable operations on Windows must be packaged as `.bat` scripts whenever practical.

The agent must follow:

1. For startup, test, build, or other repeated commands, prefer creating/updating a `.bat` entry script.
2. If a corresponding `.bat` already exists, responses and docs should prioritize the `.bat` usage instead of raw command lines.
3. When adding a new workflow that users are expected to run manually, provide a `.bat` file in the project root when feasible.
4. Keep `.bat` scripts small and focused (one purpose per script), and use clear file names.
