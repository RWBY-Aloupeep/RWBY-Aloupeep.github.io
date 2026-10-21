# Local preview in a container: `docker compose up`, then open
# http://localhost:4000. The Dev Container (.devcontainer/) uses it too.
FROM ruby:3.3

# A regular user with the usual host UID, so files Jekyll writes into the
# mounted repository stay editable outside the container.
RUN useradd --create-home --uid 1000 vscode \
 && mkdir -p /usr/src/app \
 && chown vscode /usr/src/app

WORKDIR /usr/src/app
USER vscode

COPY Gemfile ./
RUN bundle install

EXPOSE 4000
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0"]
