# Step 1: Use the official Node.js 21 image as the base image
FROM node:21-alpine as builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile --prod

# Copy the rest of your application code
COPY . .

# Generate Prisma client and run Prisma migrations
# This ensures that Prisma client types are up-to-date and ready for use in the application
RUN npx prisma generate

# Compile TypeScript to JavaScript
RUN pnpm run build

# Step 2: Use a smaller base image to run the application
FROM node:21-alpine

WORKDIR /usr/src/app

# Copy built dependencies from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]

