FROM node

COPY ./package.json .
COPY ./package-lock.json .
COPY . .

RUN npm install
RUN npm install -g pm2

EXPOSE 5000

CMD npm run start