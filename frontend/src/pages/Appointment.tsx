import {useEffect, useState} from "react";
import {fetchSearch} from "../api/search.ts";
import type {SearchResponse} from "../types/search.ts";

export default function Appointment(){
    // const [term, setTerm] = useState('')
    // const [results, setResults] = useState<SearchResponse['results']>([])
    // const [error, setError] = useState<string | null>(null)
    //  useEffect(() => {
    //
    //      async () => {
    //             try {
    //                 setError(null)
    //                 const data = await fetchAppointment()
    //                 setResults(data.results)
    //             } catch (e) {
    //                 setError('Não foi possível buscar.')
    //                 setResults([])
    //             }
    //         }, 400)
    //
    // }, [])
    return (
        <div>Appointment

        </div>
    )
}