export interface Ticket {
    ticket_id : string,
    username : string,
    phonenumber: string,
    email: string,
    date: string,
    description: string,
    assigned_name: string,
    assigned_email: string,
    assigned_phone: string,
    status: string,
    admin_note: string,
    downloadJson: any[],
}
