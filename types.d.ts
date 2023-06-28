export interface Event {
    _id: string
    name: string
}

export interface Access {
    _id: string
    name: string
    kento_type: string
    event: string
    confirmed_quantity: int
    isSelect?: boolean
}

export interface KentoEntity {
    _id: string
    access: string
    owner: string?;
    owner_email: string
    scan_terminal: string
    isUsed?: boolean
    isSelect?: boolean
    toUpdate? : boolean
    accessName?: string
    accessKentoType?: string
}

export interface UpdatedEntity {
    _id: string
    access: string
    owner: User
    scan_terminal: string?
    scan_date: string?
}

export interface Email {
    email: string
}

export interface Authentication {
    email: Email
}

export interface User {
    _id: string
    first_name: string
    last_name: string
    authentication: Authentication?
    email: string?
}

export interface EnrichedUser {
    // _id: string
    first_name: string?;
    last_name: string?;
    email: string
    kentoEntities: [KentoEntity]
}