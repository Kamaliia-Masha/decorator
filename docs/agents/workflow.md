# Workflow: From User Demand to Release

Process diagram across roles (Marketing & Community Lead → Game Designer → Development Lead → QA Lead → Producer).

```mermaid
flowchart TB
    subgraph research[" "]
        U[Users / potential customers]
        M1[Marketing & Community Lead]
        U -->|demand, feedback, surveys| M1
    end

    subgraph design[" "]
        GD[Game Designer]
        M1 -->|brief, idea| GD
        GD -->|design variants| M1
        M1 -->|not approved| GD
        M1 -->|approved| GD_OK[Design approved]
        GD -.->|check: rights, API, patents| GD
    end

    subgraph dev[" "]
        DL[Development Lead]
        GD_OK --> DL
        DL -->|too complex / impossible| GD
        GD -->|revised design| DL
        DL -->|build ready| QA_IN[Build to QA]
    end

    subgraph qa[" "]
        QA[QA Lead]
        QA_IN --> QA
        QA -->|tests fail| DL
        QA -->|forms and forums to test| QA
        M1 -.->|feedback forms| QA
        QA -->|all tests pass| SIGN[QA sign-off]
    end

    subgraph release[" "]
        P[Producer]
        SIGN --> P
        P -->|platform deals, buffer for third-party tech| ROLL[Gradual rollout]
        ROLL --> M2[Marketing: promote to users]
    end

    style M1 fill:#6b2d5c,color:#fff
    style GD fill:#2d5c2d,color:#fff
    style DL fill:#c45a1a,color:#fff
    style QA fill:#1a3a7a,color:#fff
    style P fill:#2d5c2d,color:#fff
```

## Steps in short

1. **Marketing & Community Lead** discovers user demand (surveys, feedback, popular gamers) and brings the idea to the **Game Designer**.
2. **Game Designer** produces design variants and checks rights/API/patents. Nothing moves forward until **Marketing approves**.
3. Approved design goes to **Development Lead**. If something is impossible or too complex to implement, it goes back to the designer to change the design.
4. The build goes to **QA Lead**. QA tests the game and the feedback forms/forums from marketing. When tests fail, they report to the developer until all tests pass.
5. After QA sign-off, the **Producer** negotiates with platforms, plans with buffer for third-party risks, and runs **gradual rollout** (not to all users at once).
6. **Marketing & Community Lead** promotes the game to users.
