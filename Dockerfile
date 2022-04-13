FROM node:17-alpine 
WORKDIR /usr/src/app
COPY . .
RUN echo 'HTTP_PORT=3000' >> .env \
  && echo 'RABBIT_HOST=amqp://queue:5672' >> .env
RUN yarn install \
  && yarn build
EXPOSE 3000
CMD ["yarn", "start"]
