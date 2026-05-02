# Interpretador de Blocos — Norte Code

**Última atualização:** 02/05/2026
**Versão:** 0.1.0 (Setup Inicial — interfaces definidas, implementação pendente)

---

## 1. O que é o Interpretador

O interpretador é o **motor central** do Norte Code. Ele transforma a sequência de blocos que a criança montou em ações executáveis no cenário do nível. É o equivalente a um compilador/runtime simplificado para a linguagem visual do app.

## 2. Fluxo de Execução

```
[Criança monta blocos] → [Aperta "Executar"]
       │
       ▼
[Interpretador recebe programa + estado do mundo]
       │
       ▼
[Executa bloco a bloco, gerando ExecutionSteps]
       │
       ▼
[Retorna ExecutionResult (sucesso/falha + steps)]
       │
       ▼
[Animador reproduz os steps visualmente no cenário]
```

## 3. Tipos de Blocos Suportados

| Tipo | Label (criança vê) | Conceito | Nível de introdução |
|------|-------------------|----------|-------------------|
| `move_forward` | "Andar para frente" | Sequência | 1 |
| `turn_left` | "Virar à esquerda" | Direção | 3 |
| `turn_right` | "Virar à direita" | Direção | 3 |
| `plant` | "Plantar" | Ação | 1 |
| `water` | "Regar" | Ação | 2 |
| `pick_fruit` | "Pegar fruta" | Ação + variável | 8 |
| `repeat` | "Repetir N vezes" | Loop | 4 |
| `if_condition` | "Se..." | Condicional | 6 |
| `if_else` | "Se... senão..." | Condicional dupla | 7 |
| `define_function` | "Definir [nome]" | Função | 9 |
| `call_function` | "Fazer [nome]" | Chamada de função | 9 |
| `stop` | "Parar" | Controle | 8 |

## 4. Modelo de Mundo (WorldState)

O mundo de cada nível é representado como um grid 2D. Cada célula pode conter um tipo de conteúdo (`CellContent`): vazio, semente, broto, flor, fruta, poça, pedra, canteiro, cesta.

O jogador tem posição (x, y), direção (norte/sul/leste/oeste) e inventário (frutas coletadas).

## 5. Condições de Vitória (GoalCondition)

Cada nível define uma condição de vitória que o interpretador verifica ao final da execução:

- `reach_position` — jogador chegou a uma posição específica
- `plant_all_seeds` — todas as sementes foram plantadas
- `water_all_sprouts` — todos os brotos foram regados
- `collect_fruits` — N frutas coletadas
- `tend_all_flowerbeds` — todos os canteiros cuidados
- `custom` — função customizada de verificação

## 6. Execução Step-by-Step

O interpretador não executa tudo de uma vez. Ele gera uma lista de `ExecutionStep`, cada um representando uma ação atômica (mover, virar, plantar, etc.). Isso permite que o componente de animação reproduza cada passo visualmente com timing controlado.

Cada step contém:
- A ação realizada
- O estado do jogador antes e depois
- Mudanças no mundo (se houver)
- O ID do bloco que gerou o step (para highlight visual)

## 7. Proteção contra Loop Infinito

O interpretador tem um limite de `MAX_EXECUTION_STEPS = 200`. Se o programa da criança gerar mais que 200 steps sem atingir a condição de vitória, a execução para com mensagem amigável ("Seu programa ficou rodando demais! Tente simplificar.").

## 8. Como Adicionar um Novo Tipo de Bloco

1. Adicionar o tipo em `BlockType` (arquivo `blocks.ts`)
2. Criar a interface específica se necessário (ex: `RepeatBlock`)
3. Adicionar o label em português no `createBlock()`
4. Implementar a lógica de execução no `interpreter.ts`
5. Atualizar esta documentação

## 9. Status de Implementação

- [x] Interfaces e tipos definidos
- [ ] Lógica de execução sequencial
- [ ] Suporte a loops (simples e aninhados)
- [ ] Suporte a condicionais (if e if/else)
- [ ] Suporte a variáveis (contador)
- [ ] Suporte a funções (definir/chamar)
- [ ] Detecção de loop infinito
- [ ] Testes unitários
