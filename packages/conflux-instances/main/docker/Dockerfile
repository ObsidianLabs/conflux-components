FROM rust:buster

RUN apt update && apt install -y clang libsqlite3-dev pkg-config libssl-dev cmake && rm -rf /var/lib/apt/lists/*

ADD install_conflux.sh /
RUN /install_conflux.sh && rm -f install_conflux.sh

# RUN rm -rf /tmp/*

USER root

# cmake pkg-config libssl-dev git gcc build-essential libclang-dev