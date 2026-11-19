# Talentos IC - Backend

Backend da aplicação **Talentos IC**, responsável pela API REST, autenticação, regras de negócio e persistência dos dados.

---

## Tecnologias

O projeto foi desenvolvido utilizando:

- Node.js 22
- Express
- PostgreSQL 15
- Prisma ORM
- JWT
- Swagger
- Docker
- ESLint
- Prettier

---

## Documentação

### Manual de Implantação

A documentação completa de implantação encontra-se disponível [aqui](https://docs.google.com/document/d/1IlNzT2h87PjmWpdiZwCwqP_4VFyZkq6ARqbqVcQJrlk/edit?usp=sharing).

### Documentação da API

Após iniciar a aplicação, a documentação Swagger estará disponível em:

```text
http://localhost:5001/api-doc/v1/
```

---

## Como executar

### Pré-requisitos

- Docker

---

### Clonando o repositório

```bash
git clone https://github.com/freddurao/talents-ic-tcc

cd talents-ic-tcc
```

---

### Configurando o ambiente

Crie o arquivo `.env` a partir do exemplo:

```bash
cp env.example .env
```

Preencha as variáveis de ambiente conforme necessário.

---

### Executando a aplicação

Com o Docker instalado, basta executar:

```bash
docker compose up --build
```

Durante a inicialização serão realizados automaticamente:

- criação do banco PostgreSQL;
- instalação das dependências;
- geração do Prisma Client;
- sincronização do banco utilizando `prisma db push`;
- inicialização da API.

Após a conclusão, os serviços estarão disponíveis em:

| Serviço | URL |
|---------|-----|
| API | http://localhost:5001 |
| Swagger | http://localhost:5001/api-doc/v1 |

---

### Executando localmente (sem Docker)

Caso prefira executar a aplicação diretamente na máquina, será necessário possuir:

#### Pré-requisitos

- Node.js 22 ou superior
- PostgreSQL 15 ou superior

#### Instalação

Instale as dependências:

```bash
npm install
```

Copie o arquivo de ambiente:

```bash
cp env.example .env
```

Configure as variáveis de ambiente para apontarem para sua instância do PostgreSQL.

Gere o Prisma Client:

```bash
npx prisma generate
```

Sincronize o banco de dados:

```bash
npx prisma db push
```

Inicie a aplicação:

```bash
node src/index
```

Durante o desenvolvimento, também é possível utilizar o Nodemon:

```bash
npx nodemon src/index
```

Após a inicialização, a API estará disponível em:

| Serviço | URL |
|---------|-----|
| API | http://localhost:5000 |
| Swagger | http://localhost:5000/api-doc/v1/ |

---

## Estrutura do Projeto

```text
prisma/
└── schema.prisma

src/
├── controllers/
├── middlewares/
├── repositories/
├── routes/
├── services/
├── utils/
└── index.js
```
---

## Como contribuir

Este fluxo vale para os dois repositórios do projeto: este (backend) e o [frontend](https://github.com/freddurao/talentos-ic-tcc-front).

### Branches

| Branch | Papel |
|--------|-------|
| `main` | Versão estável. Só recebe a `development` quando uma etapa é concluída. |
| `development` | Branch de trabalho. Toda branch nova sai dela e volta para ela. |
| `fix/…`, `feat/…`, `refactor/…`, `docs/…`, `chore/…` | Uma branch por correção ou funcionalidade, com nome curto em português. Exemplo: `fix/busca-ignora-maiusculas`. |

Quando uma mudança envolve backend e frontend, use **o mesmo nome de branch nos dois repositórios** e cite um PR no outro.

### Passo a passo

1. Atualize a `development` e crie a sua branch a partir dela:

```bash
git checkout development
git pull
git checkout -b fix/nome-da-correcao
```

2. Faça as alterações e teste localmente.
3. Faça o commit seguindo o padrão abaixo e envie a branch:

```bash
git push -u origin fix/nome-da-correcao
```

4. No GitHub, abra um Pull Request **para a `development`**. Na descrição, diga o que mudou, quais itens do backlog o PR resolve e como testar.
5. Faça o merge com **Squash and merge**, para que cada PR vire um único commit.
6. Atualize o status dos itens resolvidos no [backlog](#backlog).

### Commits

Use o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/), em português, com os IDs do backlog no fim do título:

```text
fix(busca): ignora maiúsculas nos filtros [V-02, AD-01]
feat(empresa): lista os membros da empresa [ME-01]
docs: atualiza o fluxo de contribuição
```

Tipos mais usados: `fix` (correção), `feat` (funcionalidade nova), `refactor` (mudança interna sem alterar o comportamento), `docs` (documentação) e `chore` (configuração e manutenção).

---

## Backlog

Os bugs, melhorias e decisões pendentes do projeto estão reunidos no documento **[Talentos IC — Backlog do tour de telas](https://claude.ai/artifact/HyLMeNa7ik7y5mxnqKWHGH)**. Ele foi montado percorrendo todas as telas da aplicação e lendo o código. Cada item tem a causa encontrada no código e uma sugestão de correção.

### Nomenclatura dos IDs

Cada item tem um ID no formato `PREFIXO-NÚMERO` (ex.: `V-02`). O prefixo indica a tela ou a origem do item:

| Prefixo | Tela ou origem |
|---------|----------------|
| `H` | Home (`/`) |
| `V` | Lista de vagas (`/vagas`) |
| `D` | Detalhe da vaga (`/vagas/:id`) |
| `P` | Perfis (`/perfis` e `/verperfil/:id`) |
| `E` | Empresas (`/empresas`) |
| `A` | Autenticação (`/login` e `/register`) |
| `CB` | Cabeçalho e menu do avatar |
| `MP` | Meu perfil e vagas recomendadas |
| `MV` | Minhas vagas (`/minhasvagas`) |
| `ED` | Editar dados (`/editardados`) |
| `CE` | Cadastrar empresa (`/cadastrar-empresa`) |
| `SP` | Candidato sem perfil (modal "Perfil Incompleto") |
| `ME` | Minha empresa (`/minha-empresa`) |
| `JF` | Formulário de vaga (`/formulariovaga`) |
| `AD` | Painel do admin (`/gerenciarsistema`) |
| `TD` | Testes destrutivos e casos extremos |
| `C` | Achados da análise de código (bugs, segurança e dívida técnica) |

### Campos de cada item

- **Tipo:** Bug, UX / Visual, Melhoria, Segurança ou Dívida técnica.
- **Prioridade:** Alta, Média ou Baixa.
- **Status:** Aberto, Em andamento, Resolvido, Descartado ou A discutir. "A discutir" marca itens que precisam de uma decisão antes de serem implementados.

O documento termina com a seção **"Decisões de design pendentes"**, que agrupa os itens visuais que aparecem em várias telas (paleta de cores, botões, modais etc.). Ela deve ser resolvida antes de corrigir esses itens tela a tela.

---

## Licença

Projeto desenvolvido no âmbito da Universidade Federal da Bahia (UFBA).

A definição da licença permanece pendente.