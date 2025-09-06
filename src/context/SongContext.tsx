/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { SONG_SERVICE } from "../serviceUrls";


const server = `${SONG_SERVICE}`;


export interface Song{
    id: string;
    title : string;
    description : string;
    thumbnail : string;
    audio : string;
    album : string;
}

interface SongContextType{
    songs : Song[],
    song : Song | null,
    isPlaying : boolean,
    setIsPlaying : (value : boolean) => void,
    loading : boolean,
    selectedSong : string | null,
    setSelectedSong : (id : string) => void,
    albums : Album[],
    fetchSingleSong : () => Promise<void>,
    nextSong : () => void,
    prevSong : () => void,
    albumSong : Song[],
    albumData : Album | null,
    fetchAlbumSongs : (id : string) => Promise<void>,
    fetchSongs : () => Promise<void>,
    fetchAlbums : () => Promise<void>,
}

export interface Album{
    id: string;
    title : string;
    description : string;
    thumbnail : string;
}

const SongContext = createContext<SongContextType | undefined>(undefined);

interface SongProviderProps {
    children : ReactNode,
}

export const SongProvider: React.FC<SongProviderProps> = ({children}) => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedSong, setSelectedSong] = useState<string | null> (null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [song, setSong] = useState<Song | null>(null);
    const [index, setIndex] = useState<number>(0);
    const [albumSong, setAlbumSong] = useState<Song[]>([]);
    const [albumData, setAlbumData] = useState<Album | null>(null);



    const fetchAlbumSongs = useCallback(async(id : string) => {
        setLoading(true);
        try {
            const {data} = await axios.get<{songs: Song[]; album : Album}>(`${server}/api/v1/album/${id}`);
            setAlbumData(data.album);
            setAlbumSong(data.songs);

        } catch (error) {
            console.log(error);
        }finally{
            setLoading(false);
        }
    },[]);

    const fetchSongs = useCallback(async() => {
        setLoading(true);
        try {
            const {data} = await axios.get<Song[]>(`${server}/api/v1/song/all`);
            setSongs(data);
            if(data.length > 0){
                setSelectedSong(data[0].id.toString());
            }
            setIsPlaying(false);
        } catch (error) {
            console.log(error);
        }finally{
            setLoading(false);
        }
    },[]);

    const fetchSingleSong = useCallback(async() => {
        if(!selectedSong) return;
        try {
            const {data} = await axios.get<Song>(`${server}/api/v1/song/${selectedSong}`);
            setSong(data);
        } catch (error) {
            console.log(error);
        }
    },[selectedSong]);

    const fetchAlbums = useCallback(async() => {
        setLoading(true);
        try {
            const {data} = await axios.get<Album[]>(`${server}/api/v1/album/all`);
            setAlbums(data);
        } catch (error) {
            console.log(error);
        }finally{
            setLoading(false);
        }
    },[]);

    const nextSong = useCallback(() => {
        if(index === songs.length - 1) {
            setIndex(0);
            setSelectedSong(songs[0]?.id.toString());
        }else{
            setIndex((prevIndex) => prevIndex + 1);
            setSelectedSong(songs[index + 1]?.id.toString());
        }
    },[index, songs]);

    const prevSong = useCallback(() => {
        if(index > 0){
            setIndex((currIndex) => currIndex - 1);
            setSelectedSong(songs[index - 1]?.id.toString());
        }
    },[index, songs]);

    useEffect(() => {fetchSongs(); 
        fetchAlbums();
    }, []);
    return <SongContext.Provider value={
        {   songs, 
            selectedSong, 
            setSelectedSong, 
            isPlaying, 
            setIsPlaying, 
            loading, 
            albums, 
            fetchSingleSong, 
            song, 
            nextSong, 
            prevSong,
            fetchAlbumSongs,
            albumData,
            albumSong,
            fetchSongs,
            fetchAlbums
        }}>{children}</SongContext.Provider>
}

export const useSongData  = () : SongContextType => {
    const context = useContext(SongContext);
    if(!context){
        throw new Error("useSongData must be used within the song provider.")
    }
    return context;
};