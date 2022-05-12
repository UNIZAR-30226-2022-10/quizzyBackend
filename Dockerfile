
FROM node

COPY ./package.json .
COPY ./package-lock.json .
COPY . .

RUN npm install

EXPOSE 5000

CMD npm run start
