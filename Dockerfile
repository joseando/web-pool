############################
# Docker build environment #
############################

FROM node:16-bullseye AS build

WORKDIR /build

COPY . .

RUN npm i && \
    npm run build

############################
# Docker final environment #
############################

FROM caddy:2.4.6-alpine

LABEL maintainer="OpenChia <contact@openchia.io>" \
      description="OpenChia Angular Website" \
      repository="https://github.com/openchia/web.git"

EXPOSE 80
WORKDIR /var/www/openchia

COPY --from=build /build/dist/openchia .
COPY ./docker/caddy/Caddyfile /etc/Caddyfile.tpl
COPY ./docker/entrypoint.sh /entrypoint.sh

CMD ["/bin/sh", "/entrypoint.sh"]
