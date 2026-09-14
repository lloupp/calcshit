# Cagômetro 💩

Calculadora satírica que estima quanto do salário mensal corresponde ao tempo passado no banheiro durante o expediente.

## Site

GitHub Pages: https://lloupp.github.io/calcshit/

## Stack

- HTML, CSS e JavaScript nativos;
- zero dependências de produção;
- sem build;
- testes unitários com `node:assert`;
- CI no GitHub Actions;
- deploy automático no GitHub Pages.

## Rodar localmente

Abra `index.html` diretamente ou sirva a pasta:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Testes

```bash
npm test
```

## Cálculo

```text
valor por minuto = salário / (dias por mês × horas por dia × 60)
valor no banheiro = valor por minuto × idas por dia × minutos por ida
```

É uma brincadeira sem valor científico, contábil ou trabalhista.
