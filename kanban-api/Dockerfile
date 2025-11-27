FROM node:25.2.1

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8787
EXPOSE 4983

ENTRYPOINT ["/entrypoint.sh"]
