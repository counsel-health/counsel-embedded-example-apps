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


## Important Notes

NextJS by default will server render all components. Its critical to prevent the iFrame from being server rendered as the signed app url is a one-time use url that needs to be rendered client side to set authentication cookies correctly.

To prevent the iFrame from being server rendered, check out the implementation of the [CounselApp](./src/components/counsel/CounselApp.tsx) component.

## Caching of Signed App Url

Ideally, the signed app url is cached for the entirety of the user's session. This is to prevent flashing of the iFrame each time its reloaded.
If instead, a new signed app url is generated each time the iFrame is reloaded, the user will see a flash of the iFrame loading.
For the demo app, this is implemented using [NextJS's caching system](https://nextjs.org/docs/app/deep-dive/caching). Importantly, the cache is invalidated when the user signs out.

## Caching of the iFrame

Ideally the Counsel iFrame is mounted into the DOM once and never removed.
This is to prevent the iFrame from being torn down by the browser on navigation.
The demo app achieves this in NextJS by mounting the [ChatPage](./src/components/ChatPage.tsx) component in the layout and not the page.
It then shows and hides the iframe based on the current route.















