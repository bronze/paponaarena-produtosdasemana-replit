# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the **Papo na Arena Radar** podcast analytics app. PostHog JS is initialized in `client/src/main.tsx` with `history_change` pageview capture, which automatically tracks SPA navigation via wouter's History API routing. Fifteen custom events were instrumented across six files to capture the most valuable user interactions — content discovery, external link engagement, filtering, sorting, and dashboard navigation. No user authentication exists in this app, so no `identify`/`reset` flows were added.

## Events instrumented

| Event name | Description | File |
|---|---|---|
| `episode_viewed` | User navigated to an episode detail page. | `client/src/pages/episodes.tsx` |
| `episode_year_filtered` | User applied a year filter on the episodes list. | `client/src/pages/episodes.tsx` |
| `episode_external_link_clicked` | User clicked the YouTube or Spotify link on an episode detail page. | `client/src/pages/episodes.tsx` |
| `product_viewed` | User navigated to a product detail page. | `client/src/pages/products.tsx` |
| `product_searched` | User typed a query into the product search input. | `client/src/pages/products.tsx` |
| `product_sort_changed` | User changed the sort column or direction on the products list. | `client/src/pages/products.tsx` |
| `product_list_expanded` | User clicked 'Ver mais' to reveal products with 2 or fewer mentions. | `client/src/pages/products.tsx` |
| `product_url_clicked` | User clicked the 'Visitar site' external link on a product detail page. | `client/src/pages/products.tsx` |
| `person_viewed` | User navigated to a person's detail page. | `client/src/pages/people.tsx` |
| `people_sort_changed` | User changed the sort mode (mentions vs alphabetical) on the people list. | `client/src/pages/people.tsx` |
| `category_viewed` | User navigated to a category detail page. | `client/src/pages/categories.tsx` |
| `category_searched` | User typed a query into the category search input. | `client/src/pages/categories.tsx` |
| `podcast_link_clicked` | User clicked the Spotify or YouTube button in the sidebar footer. | `client/src/components/app-sidebar.tsx` |
| `dashboard_stat_card_clicked` | User clicked one of the summary stat cards on the dashboard. | `client/src/pages/dashboard.tsx` |
| `dashboard_latest_episode_clicked` | User clicked the latest episode highlight card on the dashboard. | `client/src/pages/dashboard.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: [Analytics basics (wizard)](https://us.posthog.com/project/518505/dashboard/1869662)
- **Insight**: [Content views over time](https://us.posthog.com/project/518505/insights/pzavI88q)
- **Insight**: [External link clicks by platform](https://us.posthog.com/project/518505/insights/rdaIZmrO)
- **Insight**: [Product search and discovery actions](https://us.posthog.com/project/518505/insights/vIwx7qm4)
- **Insight**: [Episode year filter usage](https://us.posthog.com/project/518505/insights/jXvjWMtY)
- **Insight**: [Dashboard engagement](https://us.posthog.com/project/518505/insights/2sHyft79)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` to `.env.example` and any bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
