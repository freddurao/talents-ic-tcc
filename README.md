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

cd vagas-backend
```

---

### Configurando o ambiente

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
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
cp .env.example .env
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

## Testes

Execute os testes com:

```bash
npm test
```

---

## Padronização de Código

O projeto utiliza **ESLint** e **Prettier** para padronização do código.

No Visual Studio Code recomenda-se habilitar a formatação automática adicionando as seguintes configurações:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
}
```

---

## Como contribuir

1. Faça um fork do repositório.
2. Crie uma branch para sua funcionalidade:

```bash
git checkout -b feature/minha-feature
```

3. Realize as alterações desejadas.
4. Faça o commit:

```bash
git commit -m "feat: descrição da funcionalidade"
```

5. Envie a branch para o seu fork:

```bash
git push origin feature/minha-feature
```

6. Abra um Pull Request.

---

## Licença

Projeto desenvolvido no âmbito da Universidade Federal da Bahia (UFBA).

A definição da licença permanece pendente.