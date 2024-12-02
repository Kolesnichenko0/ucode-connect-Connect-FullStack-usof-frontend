import React, {useState, useRef, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {searchPosts} from '../../actions/postActions.ts';
import {RootState} from '../../store.ts';
import {Input} from '../ui/input.tsx';
import {Link} from 'react-router-dom';
import {Search, X} from 'lucide-react';
import {cn} from '@/lib/utils.ts';

const PostSearchDropdown = () => {
    const dispatch = useDispatch();
    const [query, setQuery] = useState('');
    const [isResultsVisible, setIsResultsVisible] = useState(false);
    const {searchResults} = useSelector((state: RootState) => state.posts);
    const searchRef = useRef<HTMLDivElement>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value;
        setQuery(searchValue);

        if (searchValue.length >= 1) {
            dispatch(searchPosts(searchValue));
            setIsResultsVisible(true);
        } else {
            setIsResultsVisible(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsResultsVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const clearSearch = () => {
        setQuery('');
        setIsResultsVisible(false);
    };

    const highlightMatchedText = (text: string, query: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase()
                ? <span key={index} className="bg-primary/20 font-semibold">{part}</span>
                : part
        );
    };

    return (
        <div ref={searchRef} className="relative w-full">
            <div className="relative">
                <Input
                    type="text"
                    placeholder="Search posts..."
                    value={query}
                    onChange={handleSearch}
                    className={cn(
                        "pl-10 pr-10 w-full",
                        "focus:ring-2 focus:ring-primary/30 transition-all duration-300",
                        "border-border/50 hover:border-primary/50"
                    )}
                />
                {query ? (
                    <>
                        <X
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-destructive transition-colors"
                            size={20}
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                size={20}/>
                    </>
                ) : (
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                            size={20}/>
                )}
            </div>

            {isResultsVisible && query.length > 0 && (
                <div
                    className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-border/50 rounded-lg shadow-xl overflow-hidden">
                    {searchResults.length > 0 ? (
                        searchResults.slice(0, 5).map((post) => (
                            <Link
                                key={post.id}
                                to={`/posts/${post.id}`}
                                onClick={() => setIsResultsVisible(false)}
                                className={cn(
                                    "block px-4 py-3 border-b last:border-b-0 border-border/20",
                                    "hover:bg-accent/30 transition-colors duration-200",
                                    "flex flex-col space-y-1 group"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="font-medium text-sm group-hover:text-primary transition-colors">
                                        {highlightMatchedText(post.title, query)}
                                    </span>
                                    {post.createdAt && (
                                        <span className="text-xs text-muted-foreground ml-2">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                {post.excerpt && (
                                    <p className="text-xs text-muted-foreground line-clamp-1 opacity-75">
                                        {highlightMatchedText(post.excerpt, query)}
                                    </p>
                                )}
                            </Link>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-muted-foreground text-center text-sm">
                            No posts found matching your search
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostSearchDropdown;