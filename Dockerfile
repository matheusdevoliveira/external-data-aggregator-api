# ==========================================
# ETAPA 1: Build (Compilação do TypeScript)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copia arquivos de dependências
COPY package*.json ./

# Instala TODAS as dependências (incluindo devDependencies para o build)
RUN npm ci --legacy-peer-deps

# Copia todo o código-fonte
COPY . .

# Compila o projeto NestJS para a pasta dist/
RUN npm run build

# Limpa devDependencies e instala APENAS dependências de produção
RUN npm prune --production --legacy-peer-deps

# ==========================================
# ETAPA 2: Runner (Imagem leve de Produção)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copia dependências de produção da etapa builder
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Define usuário sem privilégios de root por segurança
USER node

# Expõe a porta da aplicação
EXPOSE 3000

# Comando de inicialização em produção
CMD ["node", "dist/main.js"]