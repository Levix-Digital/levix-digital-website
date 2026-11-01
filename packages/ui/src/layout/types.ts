/** What the layout needs to know about a site it links to; the site passes it (ui owns no facts). */
export interface LayoutSiteLink {
  readonly id: string
  readonly name: string
  readonly url: string
}

/** The company facts shown in the footer. */
export interface LayoutCompany {
  readonly name: string
  readonly email: string
  readonly location: { readonly city: string; readonly province: string; readonly country: string }
}

/** The text of the shared layout, given by the site (ui owns no text). */
export interface LayoutStrings {
  readonly 'layout.skip': string
  readonly 'layout.nav': string
  readonly 'layout.menu': string
  readonly 'layout.products': string
  readonly 'layout.contact': string
  readonly 'layout.by': string
  readonly 'theme.legend': string
  readonly 'theme.system': string
  readonly 'theme.light': string
  readonly 'theme.dark': string
}
