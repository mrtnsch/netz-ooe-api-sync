# Multistage build: builder image. Refer to https://docs.docker.com/build/building/multi-stage/ if you are unfamiliar
# To push to dockerhub, you can run:
# docker buildx build --platform linux/arm64  --push -t mrtnschwz/netz-ooe-sync:latest .
FROM node:current-alpine3.19 as builder
# Create app directory
WORKDIR /app
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
# Install app dependencies
RUN npm ci
# Bundle app source
COPY . .
# Creates a "dist" folder with the production build
RUN npm run build
# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN npm ci --omit=dev && npm cache clean --force

# The actual image which will run the app
FROM node:current-alpine3.19 as production
# Set the workdir
WORKDIR /app

# Copy the built filesand minimum needed node_modules to this image
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Start the server
CMD ["node", "dist/index.js"]
