FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ git

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 5001

CMD ["npx", "nodemon", "src/index"]