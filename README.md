# Oito

Oito e uma plataforma de agendamento entre clientes e profissionais. A aplicacao permite pesquisar profissionais e servicos, visualizar perfis, criar agendamentos e gerenciar horarios e servicos na area do profissional.

## Visao Geral

O projeto esta organizado como um monorepo com duas aplicacoes:

- `frontend/`: interface web em React
- `backend/`: API REST em FastAPI

Fluxo principal da aplicacao:

1. o cliente se cadastra ou faz login
2. pesquisa um profissional ou servico
3. acessa o perfil do profissional
4. escolhe um servico e agenda uma data e horario
5. o profissional gerencia seus servicos, horarios e agendamentos
6. o sistema envia notificacoes por e-mail em eventos de agendamento

## Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Swiper

### Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- Pydantic Settings
- JWT com `python-jose`
- Hash de senha com `passlib` e `bcrypt`
- Envio de e-mails com MailerSend

## Estrutura Do Projeto

```text
oito/
|- README.md
|- frontend/
|  |- package.json
|  |- vite.config.ts
|  `- src/
|     |- App.tsx
|     |- api/
|     |- components/
|     |- context/
|     |- pages/
|     `- types/
`- backend/
   |- requirements.txt
   |- alembic.ini
   |- alembic/
   `- app/
      |- main.py
      |- settings.py
      |- database.py
      |- api/
      |- core/
      |- models/
      |- schemas/
      `- services/
```

## Funcionalidades

### Para Clientes

- cadastro de conta
- login com autenticacao JWT
- busca por profissionais e servicos
- visualizacao de perfil profissional
- criacao de agendamentos
- consulta dos proprios agendamentos

### Para Profissionais

- cadastro de servicos
- edicao e remocao de servicos
- configuracao da agenda semanal
- visualizacao de agendamentos recebidos
- confirmacao, cancelamento e reagendamento

### Sistema

- endpoint de health check
- validacao de conflitos de horario
- validacao de agenda disponivel antes do agendamento
- envio de e-mails automaticos para criacao, confirmacao, cancelamento e reagendamento

## Rotas Principais Do Frontend

- `/` - pagina inicial
- `/register` - cadastro
- `/login` - login
- `/appointment` - area de agendamentos
- `/professional/service` - gerenciamento de servicos
- `/professional/schedule` - gerenciamento de agenda
- `/profile/:professionalId` - perfil publico do profissional

## API

A API e exposta com prefixo `/api/v1`.

### Autenticacao

- `POST /api/v1/auth/login`

### Usuarios

- `POST /api/v1/users/`
- `GET /api/v1/users/me`
- `GET /api/v1/users/{user_id}`

### Busca

- `GET /api/v1/search?q=...`

### Servicos

- `GET /api/v1/services/by-professional/{professional_id}`
- `POST /api/v1/services/`
- `GET /api/v1/services/me`
- `GET /api/v1/services/{id}`
- `PUT /api/v1/services/{id}`
- `DELETE /api/v1/services/{id}`

### Agenda

- `GET /api/v1/schedules/me`
- `POST /api/v1/schedules/`
- `PUT /api/v1/schedules/me`

### Agendamentos

- `GET /api/v1/appointments/me`
- `GET /api/v1/appointments/incoming`
- `GET /api/v1/appointments/{appointment_id}`
- `POST /api/v1/appointments/`
- `PATCH /api/v1/appointments/{appointment_id}/confirm`
- `PATCH /api/v1/appointments/{appointment_id}/cancel`
- `PATCH /api/v1/appointments/{appointment_id}/reschedule`

### Health Check

- `GET /health`

## Requisitos

Antes de rodar o projeto, voce precisa ter instalado:

- Node.js
- npm
- Python 3
- PostgreSQL

## Configuracao Do Backend

Instale as dependencias:

```bash
cd backend
pip install -r requirements.txt
```

Crie um arquivo `.env` dentro de `backend/` com as variaveis necessarias:

```env
postgres_user=...
postgres_password=...
postgres_db=...
postgres_host=localhost
postgres_port=5432

jwt_secret_key=...
jwt_algorithm=HS256
access_token_expire_minutes=60

mailersend_api_token=...
mailersend_from_email=...
mailersend_from_name=Oito
```

Execute as migrations:

```bash
alembic upgrade head
```

Inicie a API:

```bash
uvicorn app.main:app --reload
```

Por padrao, o backend roda em:

```text
http://localhost:8000
```

## Configuracao Do Frontend

Instale as dependencias:

```bash
cd frontend
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend usa proxy do Vite para encaminhar `/api` e `/health` para o backend em `http://localhost:8000`.

## Scripts Disponiveis

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Backend

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

## Modelo De Dominio

### Usuario

Contem dados de identificacao, contato, endereco, tipo de conta e status de ativacao.

### Servico

Representa um servico oferecido por um profissional, incluindo nome, descricao, duracao estimada e preco.

### Agenda

Representa a disponibilidade semanal do profissional por dia da semana e faixa de horario.

### Agendamento

Relaciona cliente, profissional e servico, alem de armazenar data, hora, observacoes e status.

## Status Do Agendamento

Os agendamentos podem assumir os seguintes estados:

- `Pendente`
- `Confirmado`
- `Reagendado`
- `Cancelado`
- `Concluido`

## Integracao De E-mail

A aplicacao envia notificacoes automaticas por e-mail nos seguintes eventos:

- criacao de agendamento
- confirmacao de agendamento
- cancelamento de agendamento
- reagendamento de agendamento

A integracao e feita com MailerSend.

## Observacoes

- o `README.md` original do projeto estava vazio
- o `frontend/README.md` ainda esta no formato padrao do template Vite
- nao foi encontrado arquivo `.env.example`
- nao foi encontrado `docker-compose.yml`
- nao foi encontrada documentacao de deploy
- nao foi encontrada suite de testes configurada no repositorio

## Proximos Passos Sugeridos

- adicionar um `.env.example`
- documentar o processo de criacao do banco
- documentar deploy
- adicionar testes automatizados para backend e frontend
- substituir o README padrao do frontend por documentacao do produto