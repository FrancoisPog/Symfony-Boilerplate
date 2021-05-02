#!/bin/bash

# VARIABLES

PROJECT_NAME="Symfony 5 Boilerplate"
WEBSITE_URL="https://myproject.francois.poguet.com/"

LOG_DIR="./log"
LOG_FILE="$LOG_DIR/_deploy.$(date +%s).log"

DATE=$(date +"%d/%m/%y - %H:%M:%S")

DISCORD_WEBHOOK_URL="https://discordapp.com/api/webhooks/xxx"
DISCORD_WEBHOOK_NAME="${PROJECT_NAME} deployer - $DATE"

# FUNCTIONS

minifyText() {
  IFS=$'\n' read -r -d '' "${1}"
}

prefixByDate() {
  echo "$(date +"\`%d/%m/%y - %H:%M:%S\`") - $1"
}

createMessageWithEmbed() {
  messageContent="$1"
  embedTitle="$2"
  embedContent="$3"

  minifyText res <<-DELIM
		{
			"content": "$messageContent",
      "username": "$DISCORD_WEBHOOK_NAME",
			"embeds": [
				{
					"title": "$embedTitle",
					"description": "$embedContent"
				}
			]
		}
	DELIM
  echo "$res"
}

createSimpleMessage() {
  messageContent="$1"
  echo "{\"content\": \"$messageContent\", \"username\": \"$DISCORD_WEBHOOK_NAME\"}"
}

logInDiscord() {
  if [ "$#" -eq 3 ]; then
    data=$(createMessageWithEmbed "$1" "$2" "$3")
  else
    data=$(createSimpleMessage "$1")
  fi

  curl -X POST \
    -H "Content-Type: application/json" \
    -d "$data" \
    "$DISCORD_WEBHOOK_URL" >/dev/null 2>&1
}

sendLogsToDiscord() {
  curl -i -H 'Expect: application/json' \
    -F file=@"$LOG_FILE" \
    -F "payload_json={ \"wait\": true, \"username\": \"$DISCORD_WEBHOOK_NAME\" }" \
    $DISCORD_WEBHOOK_URL >/dev/null 2>&1
}

logInFile() {
  content=" \n>-- $1 --<"
  echo -e "$content" >>"$LOG_FILE"
}

log() {
  logInDiscord "\\\\> $1"
  logInFile "$1"
}

# SCRIPT

mkdir -p "$LOG_DIR"

echo -e "-------------------------------\n$(date)\n-------------------------------" >>"$LOG_FILE"

logInDiscord "> The deployment of *$PROJECT_NAME* has started ! :rocket:"

(
  set -e

  log "Pulling the production images"
  docker-compose --no-ansi pull

  log "Stopping the server"
  docker-compose --no-ansi down -v

  log "Starting the server in maintenance mode"
  APP_MAINTENANCE=1 docker-compose --no-ansi up -d

  log "Installing dependencies"
  docker-compose exec -T php composer install --no-dev --optimize-autoloader -n

  log "Executing database migrations"
  if ! docker-compose exec -T php php ./bin/console doctrine:migrations:up-to-date -n; then
    docker-compose exec -T php php ./bin/console doctrine:migrations:migrate -n
  fi

  log "Clearing the cache"
  docker-compose exec -T php php ./bin/console cache:clear --env=prod --no-debug -n

  log "Restarting the server"
  docker-compose --no-ansi up -d

) >>"$LOG_FILE" 2>&1

if [ $? -ne 0 ]; then
  sendLogsToDiscord
  logInDiscord ":x: Something is broken... @here \n"
  exit 1
fi

sendLogsToDiscord
logInDiscord "> The deployment succeed ! :white_check_mark:" ":link:  Visit the site here" "$WEBSITE_URL"
