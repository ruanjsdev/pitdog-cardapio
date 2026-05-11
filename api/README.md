# Pit's Dog API

O cardapio publico ja esta preparado para consumir uma API externa usando a variavel:

```env
VITE_API_URL=http://localhost:3333
```

Enquanto `VITE_API_URL` nao estiver configurada, o site usa os dados locais de `data/menu.ts`.

## Rotas publicas esperadas

- `GET /loja/config`
- `GET /categorias`
- `GET /produtos`
- `POST /pedidos`

## Formato esperado

As respostas podem vir direto como objeto/lista ou dentro de `{ "data": ... }`.

### `GET /loja/config`

```json
{
  "id": "1",
  "nomeLoja": "Pit's Dog",
  "lojaAberta": true,
  "mensagemLojaFechada": "Estamos fechados no momento.",
  "telefoneWhatsApp": "5591999999999",
  "tempoEstimadoEntrega": "40-60 min",
  "taxaEntrega": 5,
  "pedidoMinimo": 0,
  "aceitaRetirada": true,
  "aceitaEntrega": true,
  "aceitaMesa": true,
  "aceitaDinheiro": true,
  "aceitaPix": true,
  "aceitaCartao": true,
  "chavePix": ""
}
```

### `GET /categorias`

```json
[
  {
    "id": "burgers",
    "nome": "Burgers",
    "descricao": "Classicos da casa",
    "imagem": "/Hambuerguer/Sem titulo.jpeg",
    "ordem": 1,
    "ativo": true
  }
]
```

### `GET /produtos`

```json
[
  {
    "id": "x-bacon",
    "categoriaId": "burgers",
    "nome": "X Bacon",
    "descricao": "Carne artesanal, queijo e bacon.",
    "preco": 20,
    "precoPromocional": null,
    "imagem": "/Hambuerguer/x-bacon.jpeg",
    "ativo": true,
    "destaque": true,
    "ordem": 1,
    "estoqueDisponivel": true
  }
]
```

### `POST /pedidos`

O front envia somente ids, quantidades e dados do cliente. O backend deve recalcular o total.

```json
{
  "cliente": {
    "nome": "Joao Silva",
    "telefone": "5591999999999"
  },
  "tipoEntrega": "entrega",
  "endereco": {
    "rua": "Rua A",
    "numero": "123",
    "bairro": "Centro",
    "complemento": "Casa",
    "referencia": "Perto da praca"
  },
  "mesa": null,
  "pagamento": {
    "forma": "pix",
    "tipoCartao": null,
    "trocoPara": null
  },
  "itens": [
    {
      "produtoId": "x-bacon",
      "quantidade": 2,
      "observacao": "",
      "adicionais": []
    }
  ],
  "observacaoGeral": "Sem cebola"
}
```

Resposta esperada:

```json
{
  "id": "123",
  "numeroPedido": 52,
  "status": "pendente",
  "total": 45,
  "criadoEm": "2026-05-09T12:00:00Z"
}
```

Importante: quando `lojaAberta` for `false`, `POST /pedidos` tambem precisa ser bloqueado no backend.
