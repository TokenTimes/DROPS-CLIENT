FROM node:22-alpine AS build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:22-alpine

WORKDIR /frontend

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY .env ./.env

EXPOSE 3000

CMD ["npm", "start"]