FROM debian:latest

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Europe/Paris

# Outils de base
RUN apt-get update -y && apt-get install -y ca-certificates curl wget nano git zip unzip gnupg2 lsb-release tzdata

# PHP (dépôt sury.org)
RUN curl -sSLo /tmp/sury.deb https://packages.sury.org/debsuryorg-archive-keyring.deb
RUN dpkg -i /tmp/sury.deb
RUN echo "deb [signed-by=/usr/share/keyrings/deb.sury.org-php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list
RUN apt-get update -y && apt-get install -y php8.5-cli php8.5-curl php8.5-intl php8.5-xml php8.5-zip php8.5-mbstring php8.5-gd php8.5-mysql php8.5-sqlite3

# Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Symfony CLI
RUN curl -1sLf 'https://dl.cloudsmith.io/public/symfony/stable/setup.deb.sh' | bash
RUN apt-get install -y symfony-cli

# nvm + Node.js LTS
ENV NVM_DIR=/usr/local/nvm
RUN mkdir -p $NVM_DIR
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
RUN . $NVM_DIR/nvm.sh && nvm install --lts && nvm alias default 'lts/*'
RUN . $NVM_DIR/nvm.sh && ln -s "$(dirname $(dirname $(nvm which default)))" $NVM_DIR/current
ENV PATH="$NVM_DIR/current/bin:$PATH"

# Fuseau horaire
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Utilisateur non-root (même UID que ton utilisateur Ubuntu)
ARG UID=1000
RUN useradd -m -u ${UID} -s /bin/bash dev
RUN mkdir -p /app && chown -R dev:dev /app $NVM_DIR
USER dev

WORKDIR /app
EXPOSE 8000
CMD ["sleep", "infinity"]
