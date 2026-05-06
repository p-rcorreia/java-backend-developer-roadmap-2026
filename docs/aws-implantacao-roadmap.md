# Plano de implantação AWS do Roadmap

## Objetivo

Implantar o app **Java Backend Developer Roadmap 2026** na AWS de forma incremental, barata e segura, evoluindo de um site estático simples até uma aplicação com autenticação e progresso salvo na nuvem.

Stack alvo:

```txt
S3 + CloudFront + Cognito + API Gateway + Lambda + DynamoDB
```

Ideia geral:

```txt
Navegador
  -> CloudFront
  -> S3 com site estático

Navegador
  -> Cognito para login
  -> API Gateway
  -> Lambda
  -> DynamoDB com progresso do usuário
```

## Visão simples

O projeto Vue não roda como `.vue` no navegador em produção.

Primeiro fazemos o build:

```txt
código fonte Vue
  -> npm run build
  -> dist/
```

A pasta `dist/` contém arquivos estáticos:

```txt
dist/
  index.html
  assets/*.js
  assets/*.css
```

Esses arquivos podem ser hospedados em S3 e entregues pelo CloudFront.

O progresso do usuário não deve ser salvo diretamente do navegador no S3, porque isso exigiria expor credenciais no frontend. Em vez disso, o frontend chama uma API segura.

Fluxo final:

```txt
Usuário marca um tópico
  -> Vue atualiza a tela
  -> Vue envia progresso para a API
  -> API Gateway valida a chamada
  -> Lambda salva no DynamoDB
```

## Fase 0 - Segurança de custo

Antes de criar qualquer recurso, configurar proteção de custo.

Checklist:

- [ ] Criar um orçamento no AWS Budgets.
- [ ] Definir alerta em US$ 1.
- [ ] Definir alerta em US$ 5.
- [ ] Conferir email de cobrança da conta AWS.
- [ ] Ativar MFA na conta root.
- [ ] Não usar usuário root para o dia a dia.
- [ ] Criar usuário IAM administrativo para uso pessoal.

Por que isso importa:

```txt
AWS cobra por uso.
Projetos pequenos tendem a custar pouco, mas erro de configuração pode gerar surpresa.
```

## Fase 1 - Entender o build local

Objetivo: entender o que o build gera antes de subir para qualquer nuvem.

Comandos:

```powershell
npm install
npm run build
```

Resultado esperado:

```txt
dist/
  index.html
  assets/
```

Validações:

- [ ] A pasta `dist/` foi criada.
- [ ] Existe `dist/index.html`.
- [ ] Existem arquivos `.js` e `.css` em `dist/assets`.
- [ ] `npm run build` termina sem erro.

Conceito:

```txt
src/App.vue não vai para o navegador do mesmo jeito.
O Vite transforma o app em HTML, CSS e JavaScript prontos.
```

## Fase 2 - Testar o build localmente

Objetivo: rodar exatamente o que seria publicado.

Comando:

```powershell
npm run build
npx vite preview
```

Validações:

- [ ] O app abre localmente.
- [ ] As rotas funcionam.
- [ ] O layout está correto.
- [ ] O progresso ainda funciona no `localStorage`.
- [ ] Nenhum erro aparece no console do navegador.

Observação:

Nesse momento ainda não existe nuvem. O progresso continua local no navegador.

## Fase 3 - Criar bucket S3 para o site estático

Objetivo: hospedar a pasta `dist/` no S3.

Recursos:

```txt
S3 bucket para frontend
```

Nome sugerido:

```txt
java-backend-roadmap-frontend
```

Checklist:

- [ ] Criar bucket S3.
- [ ] Definir região.
- [ ] Bloquear acesso público inicialmente.
- [ ] Fazer upload do conteúdo de `dist/`.
- [ ] Confirmar que `index.html` está no bucket.

Importante:

Com CloudFront, o bucket pode continuar privado. O acesso público direto pelo S3 não precisa ser aberto.

## Fase 4 - Criar CloudFront para entregar o site

Objetivo: colocar uma CDN na frente do S3.

Recursos:

```txt
CloudFront distribution
Origin Access Control
S3 bucket privado
```

Fluxo:

```txt
Usuário
  -> CloudFront
  -> S3 privado
```

Checklist:

- [ ] Criar distribuição CloudFront.
- [ ] Usar o bucket S3 como origin.
- [ ] Configurar Origin Access Control.
- [ ] Permitir que CloudFront leia o bucket.
- [ ] Definir `index.html` como default root object.
- [ ] Testar URL do CloudFront.

Validações:

- [ ] O app abre pela URL do CloudFront.
- [ ] CSS e JS carregam.
- [ ] Refresh na página funciona.
- [ ] Console do navegador não mostra erro de asset.

Observação:

Como o app é uma SPA, talvez seja necessário configurar fallback para `index.html` em erros 403/404.

## Fase 5 - Configurar domínio e DNS

Objetivo: acessar o app por um domínio próprio.

Recursos possíveis:

```txt
Route 53
CloudFront
ACM Certificate
```

Exemplo:

```txt
roadmap.seudominio.com
```

Checklist:

- [ ] Ter um domínio.
- [ ] Criar certificado HTTPS no ACM em `us-east-1`.
- [ ] Validar certificado por DNS.
- [ ] Adicionar domínio alternativo no CloudFront.
- [ ] Criar registro DNS apontando para o CloudFront.
- [ ] Testar HTTPS.

Validações:

- [ ] `https://roadmap.seudominio.com` abre o app.
- [ ] Cadeado HTTPS aparece no navegador.
- [ ] CloudFront continua entregando assets corretamente.

## Fase 6 - Criar DynamoDB para progresso

Objetivo: guardar progresso por usuário.

Recurso:

```txt
DynamoDB table
```

Nome sugerido:

```txt
roadmap-progress
```

Modelo inicial:

```json
{
  "userId": "abc123",
  "progress": {
    "topics": {},
    "filters": {},
    "darkMode": false
  },
  "updatedAt": "2026-05-06T12:00:00Z"
}
```

Chave primária:

```txt
Partition key: userId
```

Checklist:

- [ ] Criar tabela DynamoDB.
- [ ] Usar `userId` como partition key.
- [ ] Começar com modo on-demand.
- [ ] Não criar índices extras no começo.

Por que DynamoDB:

```txt
Progresso é dado de aplicação.
Cada usuário tem seu próprio registro.
É mais natural que salvar vários JSONs soltos no S3.
```

## Fase 7 - Criar Lambda para ler e salvar progresso

Objetivo: criar backend mínimo para progresso.

Endpoints desejados:

```txt
GET /progress
PUT /progress
```

Funções:

```txt
GET /progress
  -> ler userId
  -> buscar item no DynamoDB
  -> retornar progresso

PUT /progress
  -> ler userId
  -> validar JSON
  -> salvar progresso no DynamoDB
```

Checklist:

- [ ] Criar Lambda Node.js.
- [ ] Dar permissão para ler a tabela DynamoDB.
- [ ] Dar permissão para escrever na tabela DynamoDB.
- [ ] Implementar leitura de progresso.
- [ ] Implementar gravação de progresso.
- [ ] Tratar usuário sem progresso salvo.
- [ ] Retornar JSON com `Content-Type: application/json`.

Formato de resposta quando não houver progresso:

```json
null
```

Ou:

```json
{
  "topics": {},
  "filters": {
    "search": "",
    "category": "all",
    "status": "all",
    "level": "all",
    "favoritesOnly": false,
    "pendingOnly": false
  },
  "darkMode": false
}
```

## Fase 8 - Criar API Gateway

Objetivo: expor a Lambda como HTTP API.

Recursos:

```txt
API Gateway HTTP API
Lambda integration
```

Rotas:

```txt
GET /progress
PUT /progress
```

Checklist:

- [ ] Criar HTTP API.
- [ ] Criar rota `GET /progress`.
- [ ] Criar rota `PUT /progress`.
- [ ] Integrar rotas com Lambda.
- [ ] Configurar CORS para o domínio do frontend.
- [ ] Testar com `curl` ou Postman.

CORS inicial:

```txt
Allowed origin: https://roadmap.seudominio.com
Allowed methods: GET, PUT, OPTIONS
Allowed headers: Content-Type, Authorization
```

## Fase 9 - Adaptar o frontend para API em nuvem

Objetivo: trocar o backup local por API real.

Hoje:

```txt
/api/progress
```

Futuro:

```txt
https://api.seudominio.com/progress
```

Estratégia:

Criar variável de ambiente:

```txt
VITE_PROGRESS_API_URL=https://api.seudominio.com
```

O frontend usa:

```ts
const API_URL = `${import.meta.env.VITE_PROGRESS_API_URL}/progress`;
```

Checklist:

- [ ] Criar `.env.example`.
- [ ] Configurar URL local.
- [ ] Configurar URL de produção.
- [ ] Manter fallback para `localStorage`.
- [ ] Tratar erro de API sem quebrar o app.
- [ ] Mostrar progresso mesmo sem internet.

Regra prática:

```txt
localStorage continua sendo cache local.
API em nuvem vira fonte compartilhada entre navegadores.
```

## Fase 10 - Criar Cognito para login

Objetivo: autenticar usuários e salvar progresso por usuário.

Recursos:

```txt
Cognito User Pool
App Client
JWT
```

Checklist:

- [ ] Criar User Pool.
- [ ] Configurar login por email.
- [ ] Criar App Client.
- [ ] Definir callback URL.
- [ ] Definir logout URL.
- [ ] Testar criação de usuário.
- [ ] Testar login.
- [ ] Obter token JWT no frontend.

Conceito:

```txt
Usuário faz login
  -> Cognito valida
  -> Cognito devolve token
  -> Frontend usa token para chamar API
```

## Fase 11 - Proteger API com Cognito

Objetivo: impedir que qualquer pessoa salve progresso na API.

Recursos:

```txt
API Gateway Authorizer
Cognito JWT
```

Checklist:

- [ ] Criar authorizer Cognito no API Gateway.
- [ ] Exigir token nas rotas `GET /progress` e `PUT /progress`.
- [ ] Enviar header `Authorization` no frontend.
- [ ] Lambda extrair `userId` do token.
- [ ] Salvar progresso usando `userId`.

Header:

```txt
Authorization: Bearer <token>
```

Fluxo:

```txt
Vue
  -> envia token
API Gateway
  -> valida token com Cognito
Lambda
  -> recebe identidade do usuário
DynamoDB
  -> salva progresso por userId
```

## Fase 12 - Migração do progresso atual

Objetivo: não perder o progresso já salvo em `data/progress.json`.

Opções:

1. Importar manualmente pelo app depois do login.
2. Criar script para enviar `data/progress.json` para a API.
3. Inserir item inicial direto no DynamoDB.

Plano mais simples:

- [ ] Exportar progresso atual pelo app.
- [ ] Fazer login no app novo.
- [ ] Importar o JSON pelo app.
- [ ] Confirmar que salvou na nuvem.
- [ ] Abrir em outro navegador e validar.

## Fase 13 - Deploy automatizado

Objetivo: publicar o site sem upload manual.

Opções:

- GitHub Actions.
- Script local com AWS CLI.

Script conceitual:

```powershell
npm run build
aws s3 sync dist/ s3://java-backend-roadmap-frontend --delete
aws cloudfront create-invalidation --distribution-id ID --paths "/*"
```

Checklist:

- [ ] Instalar AWS CLI.
- [ ] Configurar perfil local.
- [ ] Criar script de deploy.
- [ ] Testar upload para S3.
- [ ] Testar invalidation no CloudFront.
- [ ] Automatizar no GitHub Actions depois.

## Fase 14 - Observabilidade mínima

Objetivo: conseguir investigar problemas sem exagerar.

Checklist:

- [ ] CloudWatch Logs na Lambda.
- [ ] Logar erro de leitura/escrita.
- [ ] Não logar token.
- [ ] Não logar dados sensíveis.
- [ ] Criar métrica simples de erro.
- [ ] Conferir logs após salvar progresso.

## Fase 15 - Revisão de segurança

Checklist:

- [ ] Bucket S3 do frontend não permite escrita pública.
- [ ] Bucket S3, se usado, não expõe dados privados.
- [ ] DynamoDB só é acessado pela Lambda.
- [ ] API exige Cognito nas rotas privadas.
- [ ] CORS permite apenas domínios esperados.
- [ ] Nenhuma chave AWS está no frontend.
- [ ] Nenhum segredo está commitado.
- [ ] MFA ativo na conta AWS.
- [ ] Budget configurado.

## Ordem recomendada de implementação

```txt
1. Build local
2. Preview local
3. S3 estático
4. CloudFront
5. DNS e HTTPS
6. DynamoDB
7. Lambda
8. API Gateway
9. Frontend chamando API
10. Cognito
11. API protegida por Cognito
12. Migração do progresso
13. Deploy automatizado
14. Logs e revisão de segurança
```

## O que não fazer no começo

- Não colocar Cognito antes de entender build e S3.
- Não expor credenciais AWS no frontend.
- Não deixar bucket de dados público.
- Não criar vários serviços antes de validar o passo anterior.
- Não automatizar deploy antes de fazer manualmente uma vez.
- Não tentar resolver multiusuário antes de salvar um usuário bem.

## Glossário rápido

**Build**: transforma o projeto Vue em arquivos estáticos prontos para produção.

**S3**: serviço para guardar arquivos. Pode hospedar o site estático.

**CloudFront**: CDN que entrega o site com HTTPS e cache.

**DNS**: sistema que liga um domínio, como `roadmap.seudominio.com`, ao CloudFront.

**ACM**: serviço de certificados HTTPS da AWS.

**API Gateway**: porta pública da API.

**Lambda**: função backend que roda sob demanda.

**DynamoDB**: banco NoSQL usado para salvar progresso por usuário.

**Cognito**: serviço de autenticação, login e tokens.

**JWT**: token que prova que o usuário está autenticado.

**CORS**: regra que permite o frontend chamar a API de outro domínio.

## Critério de sucesso final

O projeto estará pronto quando:

- [ ] o app abrir por uma URL pública com HTTPS;
- [ ] o usuário conseguir fazer login;
- [ ] o progresso salvar na nuvem;
- [ ] o progresso aparecer em outro navegador após login;
- [ ] o app continuar funcionando mesmo se a API falhar temporariamente;
- [ ] o custo estiver monitorado por budget;
- [ ] nenhum segredo estiver no frontend ou no GitHub.
