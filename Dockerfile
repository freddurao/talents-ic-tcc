FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache git

COPY package.json package-lock.json ./

RUN npm install

COPY . .
COPY prisma ./prisma/

RUN npm install prisma@7 @prisma/client@7

RUN npx prisma generate

EXPOSE 5000

CMD ["node", "src/index"]
