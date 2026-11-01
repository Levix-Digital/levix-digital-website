# Contract: Shared Layout

## `@levix/content`

```ts
export interface Company { name: string; email: string; location: { city: string; province: string; country: string } }
export type SiteId = 'home' | 'anycontext' | 'devcycle' | 'gedo' | 'aurora'
export type ProductId = Exclude<SiteId, 'home'>
export interface SiteLink { id: SiteId; name: string; url: string }   // url: https://<domain of domains.json>
export const company: Company
export const companySite: SiteLink                                     // id 'home'
export const products: readonly (SiteLink & { id: ProductId })[]      // AnyContext, Dev Cycle Protocol, Gedo, Aurora Dev Suite
```

## `@levix/i18n`

```ts
export const layoutStrings: LayoutStrings   // English source, keys below
```

`layout.skip` "Skip to content", `layout.nav` "Main", `layout.menu` "Menu", `layout.products` "Products", `layout.contact` "Contact", `theme.legend` "Theme", `theme.system` "System", `theme.light` "Light", `theme.dark` "Dark".

## `@levix/ui`

```vue
<SiteLayout site="gedo" :company="company" :company-site="companySite" :products="products" :strings="layoutStrings">
  <RouterView />
</SiteLayout>
```

- Renders, in order: the skip link, the header (`CompanyHeader` when `site` is `home`, otherwise `ProductHeader`), `<main id="main" tabindex="-1">` with the slot, `SiteFooter`.
- `site`: the current site id; the footer marks that site's link with `aria-current="page"`.
- `CompanyHeader`: monogram and "LEVIX DIGITAL" linked to the home, `MainNavigation` with the four products (menu button below 768 px), theme picker.
- `ProductHeader`: the product's name linked to `/`, a smaller "by Levix Digital" link to the company home, theme picker; no menu yet. v0.2 adds the product's logo, accent and menu through new props.
- `SiteFooter`: "© <year> Levix Digital Inc." (build year in the prerender, the visitor's current year once mounted), email, location, the four products.
- Each header carries a slot named `pickers` next to the theme picker, for the language picker of FEAT-029 (empty today, renders nothing).
- Adding a link (FEAT-018, FEAT-019, v0.4): add it to the props of the navigation or the footer from the site's data; the components do not change.
