export type SiteFlags = Pick<GQL.ISite, 'needsRepositoryConfiguration' | 'hasCodeIntelligence'> & {
    repositoriesCloning: GQL.IRepositoryConnection | null
}
