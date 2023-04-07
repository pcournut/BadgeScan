export interface Org {
    _id: string
    name: string
    logo: string
}

export interface Event {
    _id: string
    name: string
    main_picture: string
}

export interface Badge {
    _id: string
    name: string
    icon: string
    isSelect?: boolean
    max_supply?: number
    rollup_maxEntities?: number
}

export interface BadgeEntity {
    _id: string
    parent_badge: string
    owner: string
    scan_information?: string
    isUsed?: boolean
    isSelect?: boolean
    toUpdate? : boolean
    parentBadgeName?: string
    parentBadgeIcon?: string
}

export interface User {
    _id: string
    first_name: string
    last_name: string
    email: string
}

export interface EnrichedUser {
    _id: string
    first_name: string
    last_name: String
    email: string
    badgeEntities: [BadgeEntity]
}