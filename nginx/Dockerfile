FROM nginx:1.21.6-alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
#CMD tail -f /dev/null    # Keep the container running