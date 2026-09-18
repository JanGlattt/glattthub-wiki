# Portal hilfe.hub.glattt.com — nur der Node-Server und der fertige Build (dist/).
# Gebaut wird VOR dem Docker-Build (portal/build.sh), siehe portal/cloudbuild.yaml.
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY server.js ./
COPY dist ./dist
USER node
EXPOSE 8080
CMD ["node", "server.js"]
