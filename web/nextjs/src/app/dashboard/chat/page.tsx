/**
 * Chat page doesn't render anything as the iframe is rendered in the layout.
 * However its here for NextJS to consider it a valid page.
 *
 * NOTE: if you just render the iFrame here, it will get torn down by the browser on navigation and flash each time a user navigates to this page.
 * This is a limitation of NextJS.
 */
export default function Chat() {
  return <></>;
}
