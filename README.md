# Cinema Commerce Platform

Aplicação full stack de venda de ingressos criada como projeto de estudo de backend .NET. O sistema mantém catálogo, estoque, pedidos e pagamentos simulados em um banco SQLite.

## Funcionalidades

- catálogo de filmes com carrossel responsivo;
- abertura animada e favicon próprios em SVG;
- criação e consulta de pedidos;
- validação de quantidade e estoque;
- redução automática do estoque após a reserva;
- persistência com Entity Framework Core e SQLite;
- processamento simulado de pagamentos;
- integração HTTP entre React e ASP.NET Core;
- estados de carregamento, erro e pagamento na interface.

## Tecnologias

- React, TypeScript e Vite;
- C# e ASP.NET Core 10;
- Entity Framework Core 10;
- SQLite;
- React Native e Expo (estrutura inicial mobile).

## Estrutura

```text
cinema-commerce-platform
├── web       # interface React
├── backend   # API ASP.NET Core
└── mobile    # estrutura React Native/Expo
```

O fluxo principal é:

```text
React → API ASP.NET Core → Entity Framework Core → SQLite
```

## Executar o backend

Na pasta `backend`:

```powershell
dotnet tool restore
dotnet ef database update --project .\CinemaCommerce.Api\CinemaCommerce.Api.csproj --startup-project .\CinemaCommerce.Api\CinemaCommerce.Api.csproj
dotnet run --project .\CinemaCommerce.Api\CinemaCommerce.Api.csproj --launch-profile http
```

A API ficará disponível em `http://localhost:5175`.

## Executar o frontend

Em outro terminal, na pasta `web`:

```powershell
npm install
npm run dev
```

A interface ficará disponível em `http://localhost:5173`.

No Windows, caso a política do PowerShell bloqueie `npm.ps1`, utilize `npm.cmd`:

```powershell
npm.cmd run dev
```

## Endpoints

| Método | Endpoint | Função |
| --- | --- | --- |
| `GET` | `/api/movies` | lista filmes e estoque |
| `GET` | `/api/orders` | lista pedidos |
| `GET` | `/api/orders/{id}` | consulta um pedido |
| `POST` | `/api/orders` | cria pedido e reduz estoque |
| `GET` | `/api/payments` | lista pagamentos |
| `POST` | `/api/payments/{orderId}` | aprova um pagamento simulado |

Exemplo de criação de pedido:

```json
{
  "movieId": 4,
  "quantity": 2
}
```

## Observações

O pagamento é propositalmente simulado e não processa dados financeiros reais. O arquivo local do SQLite não é versionado; as migrations permitem recriar sua estrutura com `dotnet ef database update`.
