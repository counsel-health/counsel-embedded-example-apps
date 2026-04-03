FROM oven/bun:1.3.11 AS builder
WORKDIR /workdir
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun build --compile --minify src/index.ts --outfile ./server

FROM oven/bun:1.3.11 AS runner
WORKDIR /workdir
COPY --from=builder /workdir/server ./server
EXPOSE 4003
CMD ["./server"]
