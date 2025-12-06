#!/bin/bash

# Simple deployment script
# Upload the dist folder to your server

# Example using scp:
# scp -r dist/* user@your-server.com:/var/www/html/

# Example using rsync:
# rsync -av --delete dist/ user@your-server.com:/var/www/html/

# For nginx, make sure your server config serves static files:
# server {
#     listen 80;
#     server_name your-domain.com;
#     root /var/www/html;
#     index index.html;
#     
#     location / {
#         try_files $uri $uri/ /index.html;
#     }
# }