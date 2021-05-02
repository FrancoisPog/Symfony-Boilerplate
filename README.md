<div>
    <img src="https://user-images.githubusercontent.com/59446609/116796379-29751c80-aadc-11eb-9b9b-87b7ee987c7e.png" title="Symfony"  height="100" />
    <img src="https://user-images.githubusercontent.com/59446609/116796475-fed79380-aadc-11eb-88c6-45fede1a272a.png" title="Docker"  height="100" />
    <img src="https://user-images.githubusercontent.com/59446609/116796496-23337000-aadd-11eb-9c7f-639a5649c95c.png" title="MySQL" height="100" />
    <img src="https://user-images.githubusercontent.com/59446609/116796506-40683e80-aadd-11eb-9755-3789f809195d.png" title="Webpack" height="100" />
    <img src="https://user-images.githubusercontent.com/59446609/116796535-6f7eb000-aadd-11eb-8629-e4f19af1475c.png" title="Github Actions" height="100" />
    <img src="https://user-images.githubusercontent.com/59446609/117873763-74432100-b2a0-11eb-916a-4e7869486611.png" title="ViteJS" height="100" />
    <img src="https://user-images.githubusercontent.com/59446609/117873869-8d4bd200-b2a0-11eb-8a9e-91d7ecbaf8dc.png" title="Taskfile" height="100" />
    <img src="https://user-images.githubusercontent.com/59446609/117874011-c4ba7e80-b2a0-11eb-88f7-c2ef46c7716f.png" title="Preact" height="100" />
</div>

# Symfony 5 Boilerplate

This repository is a boilerplate for [Symfony](https://symfony.com/) applications, to quickly configure development and production environments, with lifecycle workflows.

We use [Docker](https://www.docker.com/) & [Docker-compose](https://docs.docker.com/compose/), to easily develop, test and deploy our application.

For databases, we are using [MySQL](https://www.mysql.com/) here, but it can be easily adapted for [MariaDB](https://mariadb.org/) or [Postgres](https://www.postgresql.org/).

To improve frontend development, we use [Webpack-encore](https://symfony.com/doc/current/frontend.html#webpack-encore), configured to use [SCSS](https://sass-lang.com/) and [PReact](https://preactjs.com/). A [ViteJS](https://vitejs.dev/) is configured to automatically reload the page, whenever a twig template is updated.

To automate testing and deployment, we use [Github Actions](https://github.com/features/actions) workflows. Tests will be run in each pull request, and the application will be deployed each time the `main` branch is updated.

For the production environment, we use [Nginx](https://www.nginx.com/) to serve the application.

⚠️ _The purpose of boilerplate is to speed up the configuration of this type of project, it **does not guarantee the absence of bugs**, nor any type of optimization. It doesn't aim to be perfect (yet), and will need more use to improve it. Feel free to suggest improvements, anyone who can improve it is welcome._

## Table of contents

- [Symfony 5 Boilerplate](#symfony-5-boilerplate)
  - [Table of contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Configuration before use](#configuration-before-use)
    - [Override environment files](#override-environment-files)
    - [Build Docker images](#build-docker-images)
    - [Configure the development database](#configure-the-development-database)
    - [Install development dependencies](#install-development-dependencies)
  - [Run the development environment](#run-the-development-environment)
    - [Start the server](#start-the-server)
    - [Stop the server](#stop-the-server)
    - [Testing](#testing)
    - [Continuous integration](#continuous-integration)
    - [Taskfile](#taskfile)
  - [Deploy in production](#deploy-in-production)
    - [Production environment](#production-environment)
    - [Continous deployment](#continous-deployment)
    - [Serve your application under a domain name with Nginx](#serve-your-application-under-a-domain-name-with-nginx)

## Requirements

- A Github repository
- A Docker registry ([DockerHub](https://hub.docker.com/) could help)
- A private server, with Nginx and a webhooks handler
- Docker and Docker-compose installed locally and on your production server

_In this repository, we use my personal registry `docker.francois.poguet.com`, adapt it to use yours_.

## Configuration before use

### Override environment files

The `.env` and `docker-compose.yml` files are for the local development environment, so you can replace them to suit your local needs, with the `.env.local` and` docker-compose.override files .yml`.

### Build Docker images

For MySql and Node we use the official images, but for PHP and Nginx we use custom ones (in the `./docker/` directory). We add Composer and Symfony in the official PHP image and we add a default configuration for nginx (which you shouldn't need to change).

To be able to run the project, you need to create and push docker development images to your registry, they shouldn't change in the future.
_Production images will be built in the [CI](#continuous-integration)_.
Here we only have one development image, that of php.

To do this, you just need to run this command :

```bash
docker build -t docker.francois.poguet.com/symfony5-php-dev -f ./docker/php/Dockerfile.dev .
```

### Configure the development database

To configure databases, we use an init script (`./Docker/MySQL/initdb.sql`), which creates both databases for development and testing, and the associated user. The script is executed when the MySQL data volume is first mounted (see the section about [starting the server](#start-the-server)).

**Remember to change the names of the databases, and the user credentials**. You can add databases or users as you like.

### Install development dependencies

The last step to run the server is to install the dependencies of Node and Symfony, in the associated containers. The commands are as follows:

```bash
docker-compose run php composer install
```

```bash
docker-compose run node npm install
```

## Run the development environment

### Start the server

We can now start the server, simply by starting the different containers, orchestrated by the `docker-compose.yml` file, with this command :

_You can use the `-d` option to run in detached mode, to keep control of your terminal (but you won't be able to see the logs and potential errors)._

```bash
docker-compose up
```

The Symfony application will run on [localhost:8000](localhost:8000) and PhpMyAdmin on [localhost:8081](localhost:8082).

_You can change these ports as you want, you can also change the directory where MySQL data is stored (`$HOME/docker-MySQL/sf5/` by default) but this one must be empty before initialization to avoid a lot of problems (in particular, the directory should not be the `/var/lib/MySQL` used by the MySQL service)._

**Remember to change the `MYSQL_ROOT_PASSWORD` to something more secure than `root`**.

### Stop the server

To stop the server you just have to down the containers with the command :

```bash
docker-compose down
```

### Testing

To run tests with `phpunit` in a running PHP container, just run this command :

```bash
docker-compose exec php php ./bin/phpunit
```

If you just want to run tests without starting the server, use this one :

```bash
docker-compose run php php ./bin/phpunit
```

_We use a `.env.test` file to override the `.env` for testing, for example to use a specific database (see [here](#configure-the-development-database))_.

### Continuous integration

A workflow is configured to automatically run the tests in Github Actions, in each pull request (`.github/workflows/test.yml`). It use a specific `docker-compose` and `.env` file, without development tools.

_The PHP development image is pulled from your registry into the Github Actions server for testing, so be sure you pushed them_.

**The workflow uses [Github Secrets](https://docs.github.com/en/actions/reference/encrypted-secrets) to keep private your credentials for your docker registry, don't forget to populate them in your github repository.**

### Taskfile

To simplify commands through containers, I personally use Taskfile. You can install it [here](https://taskfile.dev), and type `task --list` to see the list of available tasks.

## Deploy in production

### Production environment

To deploy to production, you must build and push the PHP production image, which contains the built front-end assets and server code.
On your production server, you need the `docker-compose.prod.yml` file, rename it to `docker-compose.yml` to be detected automatically.

You also need your `.env` file for the Symfony project.

As we only need a single database in production, we just need to set the environment variables directly in the `docker-compose` and the database and user will be created on initialization. _Again, use an empty directory for MySQL data._

_If necessary, you can initialize the database(s) with a script, with the same method as [above](#configure-the-development-database)_

The last file to have is the `deploy.sh` script, which (re)starts the server with the latest version of the PHP production image.
_If you want to manually stop the containers in production, you must use the `-v` option (`docker-compose down -v`) to stop the shared volume between the Nginx and PHP containers, otherwise the containers will not use the updated images._

To easily monitor the deployment of your project, this script uses webhooks to send logs to your Discord server, so you just need to adjust the variables at the top of the script for your project and your Discord server's webhook URL.
_See [here](https://www.digitalocean.com/community/tutorials/how-to-use-discord-webhooks-to-get-notifications-for-your-website-status-on-ubuntu-18-04#step-1-%E2%80%94-setting-up-your-discord-webhook) how to set up a webhook in your discord server_.

| Success                                                                                                         | Failure                                                                                                         |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| ![image](https://user-images.githubusercontent.com/59446609/116796228-2fb6c900-aadb-11eb-93fc-91fa887684cb.png) | ![image](https://user-images.githubusercontent.com/59446609/116796236-36454080-aadb-11eb-854e-5e9e84a92c70.png) |

### Continous deployment

A workflow is configured to automatically build and push production image in Github Actions, each time the `main` branch is updated (`.github/workflows/build.yml`).

Once the image is pushed, the action sends a webhook to your server telling it that it can run the `deploy.sh` script to update the project.

**Here too the workflow uses some Github secrets, don't forget them !**

I personally use [this tool](https://github.com/adnanh/webhook) to manage webhooks on my private server, with this configuration :

```json
{
  "id": "symfony-redeploy",
  "execute-command": "/var/www/symfony5/deploy.sh",
  "command-working-directory": "/var/www/symfony5/",
  "trigger-rule": {
    "and": [
      {
        "match": {
          "type": "payload-hash-sha1",
          "secret": "Your webhook secret",
          "parameter": {
            "source": "header",
            "name": "X-Hub-Signature"
          }
        }
      },
      {
        "match": {
          "type": "value",
          "value": "refs/heads/main",
          "parameter": {
            "source": "payload",
            "name": "ref"
          }
        }
      }
    ]
  }
}
```

### Serve your application under a domain name with Nginx

Currently, the production application is available on port 3001 on your server, but if you want to make it accessible from internet under a domain name, you need to serve it with Nginx, outside of the container.
The only thing to do is to create a virtual host, proxying port 3001, as below.

_You can find some documentation about Nginx installation and use [here](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04). Find out [here](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04-fr) how to install and configure SSL certificates with Certbot._

```nginx
server {
  server_name   myproject.francois.poguet.com;

  location / {
    proxy_pass  http://localhost:3001;
  }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/myproject.francois.poguet.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/myproject.francois.poguet.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = myproject.francois.poguet.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


  listen        80;
  server_name   myproject.francois.poguet.com;
    return 404; # managed by Certbot


}
```
