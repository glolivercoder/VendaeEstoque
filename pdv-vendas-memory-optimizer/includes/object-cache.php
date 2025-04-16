<?php
/**
 * Object Cache API: PDV Vendas Enhanced Object Cache
 *
 * @package WordPress
 * @subpackage Cache
 */

/**
 * Adds data to the cache, if the cache key doesn't already exist.
 *
 * @param int|string $key The cache key to use for retrieval later.
 * @param mixed $data The data to add to the cache.
 * @param string $group Optional. The group to add the cache to. Enables the same key
 *                           to be used across groups. Default empty.
 * @param int $expire Optional. When the cache data should expire, in seconds.
 *                           Default 0 (no expiration).
 * @return bool True on success, false if cache key and group already exist.
 */
function wp_cache_add($key, $data, $group = '', $expire = 0) {
    global $wp_object_cache;
    return $wp_object_cache->add($key, $data, $group, (int) $expire);
}

/**
 * Closes the cache.
 *
 * This function has ceased to do anything since WordPress 2.5. The
 * functionality was removed along with the rest of the persistent cache.
 *
 * This does not mean that plugins can't implement this function when they need
 * to make sure that the cache is cleaned up after WordPress no longer needs it.
 *
 * @return true Always returns true.
 */
function wp_cache_close() {
    return true;
}

/**
 * Decrements numeric cache item's value.
 *
 * @param int|string $key The cache key to decrement.
 * @param int $offset Optional. The amount by which to decrement the item's value. Default 1.
 * @param string $group Optional. The group the key is in. Default empty.
 * @return int|false The item's new value on success, false on failure.
 */
function wp_cache_decr($key, $offset = 1, $group = '') {
    global $wp_object_cache;
    return $wp_object_cache->decr($key, $offset, $group);
}

/**
 * Removes the cache contents matching key and group.
 *
 * @param int|string $key What the contents in the cache are called.
 * @param string $group Optional. Where the cache contents are grouped. Default empty.
 * @return bool True on successful removal, false on failure.
 */
function wp_cache_delete($key, $group = '') {
    global $wp_object_cache;
    return $wp_object_cache->delete($key, $group);
}

/**
 * Removes all cache items.
 *
 * @return bool True on success, false on failure.
 */
function wp_cache_flush() {
    global $wp_object_cache;
    return $wp_object_cache->flush();
}

/**
 * Retrieves the cache contents from the cache by key and group.
 *
 * @param int|string $key The key under which the cache contents are stored.
 * @param string $group Optional. Where the cache contents are grouped. Default empty.
 * @param bool $force Optional. Whether to force an update of the local cache
 *                          from the persistent cache. Default false.
 * @param bool &$found Optional. Whether the key was found in the cache (passed by reference).
 *                          Disambiguates a return of false, a storable value. Default null.
 * @return mixed|false The cache contents on success, false on failure to retrieve contents.
 */
function wp_cache_get($key, $group = '', $force = false, &$found = null) {
    global $wp_object_cache;
    return $wp_object_cache->get($key, $group, $force, $found);
}

/**
 * Retrieves multiple values from the cache in one call.
 *
 * @param array $keys Array of keys under which the cache contents are stored.
 * @param string $group Optional. Where the cache contents are grouped. Default empty.
 * @param bool $force Optional. Whether to force an update of the local cache
 *                          from the persistent cache. Default false.
 * @return array Array of values organized into groups.
 */
function wp_cache_get_multiple($keys, $group = '', $force = false) {
    global $wp_object_cache;
    return $wp_object_cache->get_multiple($keys, $group, $force);
}

/**
 * Increments numeric cache item's value.
 *
 * @param int|string $key The cache key to increment.
 * @param int $offset Optional. The amount by which to increment the item's value. Default 1.
 * @param string $group Optional. The group the key is in. Default empty.
 * @return int|false The item's new value on success, false on failure.
 */
function wp_cache_incr($key, $offset = 1, $group = '') {
    global $wp_object_cache;
    return $wp_object_cache->incr($key, $offset, $group);
}

/**
 * Sets up Object Cache Global and assigns it.
 *
 * @global WP_Object_Cache $wp_object_cache WordPress Object Cache
 */
function wp_cache_init() {
    global $wp_object_cache;
    
    if (!($wp_object_cache instanceof WP_Object_Cache)) {
        $wp_object_cache = new WP_Object_Cache();
    }
}

/**
 * Replaces the contents of the cache with new data.
 *
 * @param int|string $key The key for the cache data that should be replaced.
 * @param mixed $data The new data to store in the cache.
 * @param string $group Optional. The group for the cache data that should be replaced.
 *                           Default empty.
 * @param int $expire Optional. When to expire the cache contents, in seconds.
 *                           Default 0 (no expiration).
 * @return bool True if contents were replaced, false if original value does not exist.
 */
function wp_cache_replace($key, $data, $group = '', $expire = 0) {
    global $wp_object_cache;
    return $wp_object_cache->replace($key, $data, $group, (int) $expire);
}

/**
 * Saves the data to the cache.
 *
 * Differs from wp_cache_add() and wp_cache_replace() in that it will always write data.
 *
 * @param int|string $key The cache key to use for retrieval later.
 * @param mixed $data The contents to store in the cache.
 * @param string $group Optional. Where to group the cache contents. Enables the same key
 *                           to be used across groups. Default empty.
 * @param int $expire Optional. When to expire the cache contents, in seconds.
 *                           Default 0 (no expiration).
 * @return bool True on success, false on failure.
 */
function wp_cache_set($key, $data, $group = '', $expire = 0) {
    global $wp_object_cache;
    return $wp_object_cache->set($key, $data, $group, (int) $expire);
}

/**
 * Switches the internal blog ID.
 *
 * This changes the blog id used to create keys in blog specific groups.
 *
 * @param int $blog_id Blog ID.
 */
function wp_cache_switch_to_blog($blog_id) {
    global $wp_object_cache;
    
    if (function_exists('is_multisite') && is_multisite()) {
        $wp_object_cache->switch_to_blog($blog_id);
    }
}

/**
 * Adds a group or set of groups to the list of global groups.
 *
 * @param string|array $groups A group or an array of groups to add.
 */
function wp_cache_add_global_groups($groups) {
    global $wp_object_cache;
    $wp_object_cache->add_global_groups($groups);
}

/**
 * Adds a group or set of groups to the list of non-persistent groups.
 *
 * @param string|array $groups A group or an array of groups to add.
 */
function wp_cache_add_non_persistent_groups($groups) {
    global $wp_object_cache;
    $wp_object_cache->add_non_persistent_groups($groups);
}

/**
 * Enhanced WordPress Object Cache
 *
 * The WordPress Object Cache is used to save on trips to the database. The
 * Object Cache stores all of the cache data to memory and makes the cache
 * contents available by using a key, which is used to name and later retrieve
 * the cache contents.
 *
 * This enhanced version of the object cache is optimized for PDV Vendas and
 * provides better performance with larger memory limits.
 */
class WP_Object_Cache {
    /**
     * The amount of memory allocated for the object cache.
     *
     * @var int
     */
    private $memory_limit = 1024; // 1GB
    
    /**
     * Holds the cached objects.
     *
     * @var array
     */
    private $cache = array();
    
    /**
     * The blog prefix to prepend to keys in non-global groups.
     *
     * @var string
     */
    private $blog_prefix;
    
    /**
     * Holds the value of is_multisite().
     *
     * @var bool
     */
    private $multisite;
    
    /**
     * List of global groups.
     *
     * @var array
     */
    private $global_groups = array();
    
    /**
     * List of non-persistent groups.
     *
     * @var array
     */
    private $non_persistent_groups = array();
    
    /**
     * Total size of the cache in bytes.
     *
     * @var int
     */
    private $cache_size = 0;
    
    /**
     * Cache hits.
     *
     * @var int
     */
    public $cache_hits = 0;
    
    /**
     * Cache misses.
     *
     * @var int
     */
    public $cache_misses = 0;
    
    /**
     * Constructor.
     */
    public function __construct() {
        $this->multisite = function_exists('is_multisite') && is_multisite();
        $this->blog_prefix = $this->multisite ? get_current_blog_id() . ':' : '';
        
        // Try to get memory limit from PHP configuration
        $memory_limit = ini_get('memory_limit');
        if ($memory_limit) {
            $memory_limit = preg_replace('/[^0-9]/', '', $memory_limit);
            if ($memory_limit) {
                $this->memory_limit = intval($memory_limit);
            }
        }
        
        // Check if WP_MEMORY_LIMIT is defined
        if (defined('WP_MEMORY_LIMIT')) {
            $wp_memory_limit = WP_MEMORY_LIMIT;
            $wp_memory_limit = preg_replace('/[^0-9]/', '', $wp_memory_limit);
            if ($wp_memory_limit) {
                $this->memory_limit = intval($wp_memory_limit);
            }
        }
        
        // Add default groups
        $this->add_global_groups(array('users', 'userlogins', 'usermeta', 'user_meta', 'site-transient', 'site-options', 'site-lookup', 'blog-lookup', 'blog-details', 'rss', 'global-posts', 'blog-id-cache'));
        $this->add_non_persistent_groups(array('comment', 'counts', 'plugins'));
    }
    
    /**
     * Adds data to the cache if it doesn't already exist.
     *
     * @param int|string $key What to call the contents in the cache.
     * @param mixed $data The contents to store in the cache.
     * @param string $group Where to group the cache contents. Default 'default'.
     * @param int $expire When to expire the cache contents. Default 0 (no expiration).
     * @return bool True on success, false if cache key and group already exist.
     */
    public function add($key, $data, $group = 'default', $expire = 0) {
        if (wp_suspend_cache_addition()) {
            return false;
        }
        
        if (empty($group)) {
            $group = 'default';
        }
        
        $id = $this->get_cache_key($key, $group);
        
        if ($this->exists($id, $group)) {
            return false;
        }
        
        return $this->set($key, $data, $group, $expire);
    }
    
    /**
     * Sets the list of global groups.
     *
     * @param array $groups List of groups that are global.
     */
    public function add_global_groups($groups) {
        $groups = (array) $groups;
        
        foreach ($groups as $group) {
            $this->global_groups[$group] = true;
        }
    }
    
    /**
     * Sets the list of non-persistent groups.
     *
     * @param array $groups List of groups that are non-persistent.
     */
    public function add_non_persistent_groups($groups) {
        $groups = (array) $groups;
        
        foreach ($groups as $group) {
            $this->non_persistent_groups[$group] = true;
        }
    }
    
    /**
     * Decrement numeric cache item's value.
     *
     * @param int|string $key The cache key to decrement.
     * @param int $offset The amount by which to decrement the item's value. Default 1.
     * @param string $group The group the key is in. Default 'default'.
     * @return int|false The item's new value on success, false on failure.
     */
    public function decr($key, $offset = 1, $group = 'default') {
        if (empty($group)) {
            $group = 'default';
        }
        
        $id = $this->get_cache_key($key, $group);
        
        if (!$this->exists($id, $group)) {
            return false;
        }
        
        if (!is_numeric($this->cache[$group][$id])) {
            $this->cache[$group][$id] = 0;
        }
        
        $offset = (int) $offset;
        
        $this->cache[$group][$id] -= $offset;
        
        if ($this->cache[$group][$id] < 0) {
            $this->cache[$group][$id] = 0;
        }
        
        return $this->cache[$group][$id];
    }
    
    /**
     * Remove the contents of the cache key in the group.
     *
     * @param int|string $key What the contents in the cache are called.
     * @param string $group Where the cache contents are grouped. Default 'default'.
     * @return bool True on successful removal, false on failure.
     */
    public function delete($key, $group = 'default') {
        if (empty($group)) {
            $group = 'default';
        }
        
        $id = $this->get_cache_key($key, $group);
        
        if (!$this->exists($id, $group)) {
            return false;
        }
        
        unset($this->cache[$group][$id]);
        return true;
    }
    
    /**
     * Clears the object cache of all data.
     *
     * @return bool True on success, false on failure.
     */
    public function flush() {
        $this->cache = array();
        $this->cache_size = 0;
        return true;
    }
    
    /**
     * Retrieves the cache contents, if it exists.
     *
     * @param int|string $key What the contents in the cache are called.
     * @param string $group Where the cache contents are grouped. Default 'default'.
     * @param bool $force Whether to force an update of the local cache from the persistent cache. Default false.
     * @param bool &$found Whether the key was found in the cache (passed by reference). Default null.
     * @return mixed|false The cache contents on success, false on failure to retrieve contents.
     */
    public function get($key, $group = 'default', $force = false, &$found = null) {
        if (empty($group)) {
            $group = 'default';
        }
        
        $id = $this->get_cache_key($key, $group);
        
        if ($this->exists($id, $group)) {
            $found = true;
            $this->cache_hits++;
            
            return is_object($this->cache[$group][$id]) ? clone $this->cache[$group][$id] : $this->cache[$group][$id];
        }
        
        $found = false;
        $this->cache_misses++;
        
        return false;
    }
    
    /**
     * Retrieves multiple values from the cache in one call.
     *
     * @param array $keys Array of keys under which the cache contents are stored.
     * @param string $group Where the cache contents are grouped. Default 'default'.
     * @param bool $force Whether to force an update of the local cache from the persistent cache. Default false.
     * @return array Array of values organized into groups.
     */
    public function get_multiple($keys, $group = 'default', $force = false) {
        if (empty($group)) {
            $group = 'default';
        }
        
        $values = array();
        
        foreach ($keys as $key) {
            $values[$key] = $this->get($key, $group, $force);
        }
        
        return $values;
    }
    
    /**
     * Increment numeric cache item's value.
     *
     * @param int|string $key The cache key to increment.
     * @param int $offset The amount by which to increment the item's value. Default 1.
     * @param string $group The group the key is in. Default 'default'.
     * @return int|false The item's new value on success, false on failure.
     */
    public function incr($key, $offset = 1, $group = 'default') {
        if (empty($group)) {
            $group = 'default';
        }
        
        $id = $this->get_cache_key($key, $group);
        
        if (!$this->exists($id, $group)) {
            return false;
        }
        
        if (!is_numeric($this->cache[$group][$id])) {
            $this->cache[$group][$id] = 0;
        }
        
        $offset = (int) $offset;
        
        $this->cache[$group][$id] += $offset;
        
        if ($this->cache[$group][$id] < 0) {
            $this->cache[$group][$id] = 0;
        }
        
        return $this->cache[$group][$id];
    }
    
    /**
     * Replace the contents in the cache, if contents already exist.
     *
     * @param int|string $key What to call the contents in the cache.
     * @param mixed $data The contents to store in the cache.
     * @param string $group Where to group the cache contents. Default 'default'.
     * @param int $expire When to expire the cache contents. Default 0 (no expiration).
     * @return bool True if contents were replaced, false if original value does not exist.
     */
    public function replace($key, $data, $group = 'default', $expire = 0) {
        if (empty($group)) {
            $group = 'default';
        }
        
        $id = $this->get_cache_key($key, $group);
        
        if (!$this->exists($id, $group)) {
            return false;
        }
        
        return $this->set($key, $data, $group, $expire);
    }
    
    /**
     * Sets the data contents into the cache.
     *
     * @param int|string $key What to call the contents in the cache.
     * @param mixed $data The contents to store in the cache.
     * @param string $group Where to group the cache contents. Default 'default'.
     * @param int $expire When to expire the cache contents. Default 0 (no expiration).
     * @return bool True if contents were set, false if failed.
     */
    public function set($key, $data, $group = 'default', $expire = 0) {
        if (empty($group)) {
            $group = 'default';
        }
        
        $id = $this->get_cache_key($key, $group);
        
        if (is_object($data)) {
            $data = clone $data;
        }
        
        if (!isset($this->cache[$group])) {
            $this->cache[$group] = array();
        }
        
        // Calculate the size of the data
        $size = $this->get_size($data);
        
        // Check if we have enough memory
        if ($this->cache_size + $size > $this->memory_limit * 1024 * 1024) {
            // We need to free up some memory
            $this->free_memory($size);
        }
        
        // Update cache size
        if (isset($this->cache[$group][$id])) {
            $old_size = $this->get_size($this->cache[$group][$id]);
            $this->cache_size -= $old_size;
        }
        
        $this->cache[$group][$id] = $data;
        $this->cache_size += $size;
        
        return true;
    }
    
    /**
     * Switches the internal blog ID.
     *
     * @param int $blog_id Blog ID.
     */
    public function switch_to_blog($blog_id) {
        if ($this->multisite) {
            $this->blog_prefix = $blog_id . ':';
        }
    }
    
    /**
     * Checks if the given key exists in the cache.
     *
     * @param int|string $key What the contents in the cache are called.
     * @param string $group Where the cache contents are grouped.
     * @return bool True if the key exists, false otherwise.
     */
    private function exists($key, $group) {
        return isset($this->cache[$group]) && isset($this->cache[$group][$key]);
    }
    
    /**
     * Gets a cache key based on the key and group.
     *
     * @param int|string $key What the contents in the cache are called.
     * @param string $group Where the cache contents are grouped.
     * @return string The cache key.
     */
    private function get_cache_key($key, $group) {
        if ($this->multisite && !isset($this->global_groups[$group])) {
            return $this->blog_prefix . $key;
        }
        
        return $key;
    }
    
    /**
     * Gets the size of a variable in bytes.
     *
     * @param mixed $var The variable to get the size of.
     * @return int The size in bytes.
     */
    private function get_size($var) {
        $start_memory = memory_get_usage();
        $tmp = unserialize(serialize($var));
        return memory_get_usage() - $start_memory;
    }
    
    /**
     * Frees memory by removing old cache items.
     *
     * @param int $needed_size The amount of memory needed in bytes.
     */
    private function free_memory($needed_size) {
        // We need to free up at least 20% of the memory or the needed size, whichever is greater
        $to_free = max($needed_size, $this->memory_limit * 1024 * 1024 * 0.2);
        
        $freed = 0;
        
        // Sort groups by size
        $group_sizes = array();
        foreach ($this->cache as $group => $items) {
            $group_size = 0;
            foreach ($items as $item) {
                $group_size += $this->get_size($item);
            }
            $group_sizes[$group] = $group_size;
        }
        
        arsort($group_sizes);
        
        // Free memory from the largest groups first
        foreach ($group_sizes as $group => $size) {
            // Skip non-persistent groups
            if (isset($this->non_persistent_groups[$group])) {
                continue;
            }
            
            // Remove items from this group
            $items = $this->cache[$group];
            
            // Sort items by size
            $item_sizes = array();
            foreach ($items as $key => $item) {
                $item_sizes[$key] = $this->get_size($item);
            }
            
            arsort($item_sizes);
            
            // Remove largest items first
            foreach ($item_sizes as $key => $item_size) {
                unset($this->cache[$group][$key]);
                $freed += $item_size;
                $this->cache_size -= $item_size;
                
                if ($freed >= $to_free) {
                    break 2;
                }
            }
        }
    }
}
