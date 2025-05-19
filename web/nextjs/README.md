[Next.js](https://nextjs.org) demo app for the Counsel Embedded Product.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) to see the demo app.

Or see the live demo at [https://embedded-demo.counselhealth.com](https://embedded-demo.counselhealth.com).
Reach out to a member of the Counsel Health team to get an access code.


## Important Notes

NextJS by default will server render all components. Its critical to prevent the iFrame from being server rendered as the signed app url is a one-time use url that needs to be rendered client side to set authentication cookies correctly.

To prevent the iFrame from being server rendered, check out the implementation of the [CounselApp](./src/components/counsel/CounselApp.tsx) component.

## Caching of Signed App Url

Ideally, the signed app url is cached for the entirety of the user's session. This is to prevent flashing of the iFrame each time its reloaded.
If instead, a new signed app url is generated each time the iFrame is reloaded, the user will see a flash of the iFrame loading.
For the demo app, this is implemented using [NextJS's caching system](https://nextjs.org/docs/app/deep-dive/caching). Importantly, the cache is invalidated when the user signs out.

## Deploying to Cloud Run

The web app is deployed to Cloud Run using the `cd-nextjs-web.yml` workflow in the `.github/workflows` directory.
The workflow builds the Docker image and pushes it to Google Artifact Registry.
It then deploys the container image to Cloud Run.

Route53 hosts the subdomain at `embedded-demo.counselhealth.com` and routes requests to the Cloud Run service.

### To deploy manually, you can use the following commands:

```bash
gcloud auth configure-docker us-east1-docker.pkg.dev
docker build -t "us-east1-docker.pkg.dev/${PROJECT_ID}/embedded-demo/embedded-demo-nextjs-web:latest" --platform linux/amd64 ./
docker push "us-east1-docker.pkg.dev/${PROJECT_ID}/embedded-demo/embedded-demo-nextjs-web:latest"

gcloud run deploy embedded-demo-nextjs-web --image=us-east1-docker.pkg.dev/${PROJECT_ID}/embedded-demo/embedded-demo-nextjs-web:latest --project=${PROJECT_ID} --region=us-east1 --allow-unauthenticated --port=3001 --set-env-vars <ALL_ENV_VARS>
```















