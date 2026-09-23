// Renders a schema.org JSON-LD payload. `<` is escaped so the script tag
// can't be broken out of by data containing "</script>".
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
