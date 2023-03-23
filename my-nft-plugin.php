<?php
/**
 * Plugin Name: Mint NFTs With Woocommerce
 * Plugin URI: https://digitvl.com/algorand-nfts
 * Description: Allows users to mint NFTs on Algorand.
 * Version: 1.0.0
 * Author: Mwosa From DIGITVL
 * Author URI: https://example.com/
 * License: GPL2
 */

// Enqueue scripts and styles
function my_nft_plugin_scripts() {
    wp_enqueue_script( 'my-nft-plugin', plugin_dir_url( __FILE__ ) . 'my-nft-plugin.js', array( 'jquery' ), '1.0.0', true );
    wp_enqueue_style( 'my-nft-plugin', plugin_dir_url( __FILE__ ) . 'my-nft-plugin.css', array(), '1.0.0', 'all' );
}
add_action( 'wp_enqueue_scripts', 'my_nft_plugin_scripts' );

// Add custom field to product creation form
function my_nft_plugin_add_custom_field() {
    woocommerce_wp_text_input( array(
        'id'            => '_token_name',
        'label'         => 'Token Name',
        'placeholder'   => 'Enter token name...',
        'desc_tip'      => 'true',
        'description'   => 'Enter the name of your NFT token.',
    ) );
    woocommerce_wp_text_input( array(
        'id'            => '_token_symbol',
        'label'         => 'Token Symbol',
        'placeholder'   => 'Enter token symbol...',
        'desc_tip'      => 'true',
        'description'   => 'Enter the symbol of your NFT token.',
    ) );
    woocommerce_wp_text_input( array(
        'id'            => '_artwork_url',
        'label'         => 'Artwork URL',
        'placeholder'   => 'Enter artwork URL...',
        'desc_tip'      => 'true',
        'description'   => 'Enter the URL of your NFT artwork.',
    ) );
    woocommerce_wp_text_input( array(
        'id'            => '_royalty_rate',
        'label'         => 'Royalty Rate',
        'placeholder'   => 'Enter royalty rate...',
        'desc_tip'      => 'true',
        'description'   => 'Enter the royalty rate for the creator of the NFT (in percentage).',
    ) );
}
add_action( 'woocommerce_product_options_general_product_data', 'my_nft_plugin_add_custom_field' );

// Save custom field data
function my_nft_plugin_save_custom_field( $post_id ) {
    $token_name = isset( $_POST['_token_name'] ) ? $_POST['_token_name'] : '';
    $token_symbol = isset( $_POST['_token_symbol'] ) ? $_POST['_token_symbol'] : '';
    $artwork_url = isset( $_POST['_artwork_url'] ) ? $_POST['_artwork_url'] : '';
    $royalty_rate = isset( $_POST['_royalty_rate'] ) ? $_POST['_royalty_rate'] : '';

    update_post_meta( $post_id, '_token_name', sanitize_text_field( $token_name ) );
    update_post_meta( $post_id, '_token_symbol', sanitize_text_field( $token_symbol ) );
    update_post_meta( $post_id, '_artwork_url', sanitize_text_field( $artwork_url ) );
    update_post_meta( $post_id, '_royalty_rate', sanitize_text_field( $royalty_rate ) );
}
add_action( 'woocommerce_process_product_meta', 'my_nft_plugin_save_custom_field' );

// Add creator address field
woocommerce_wp_text_input(
    array(
        'id' => '_creator_address',
        'label' => __('Creator Address', 'my-nft-plugin'),
        'placeholder' => __('Enter the address of the NFT creator', 'my-nft-plugin'),
        'desc_tip' => 'true',
        'description' => __('This is the address that will receive royalty payments when the NFT is sold.', 'my-nft-plugin')
    )
);

// Save NFT metadata on product save
add_action('woocommerce_process_product_meta', 'save_nft_metadata');
function save_nft_metadata($post_id)
{
    // Token Name
    $token_name = get_post_meta($post_id, '_token_name', true);
    if (!empty($token_name)) {
        update_post_meta($post_id, '_nft_token_name', sanitize_text_field($token_name));
    }

    // Token Symbol
    $token_symbol = get_post_meta($post_id, '_token_symbol', true);
    if (!empty($token_symbol)) {
        update_post_meta($post_id, '_nft_token_symbol', sanitize_text_field($token_symbol));
    }

    // Artwork URL
    $artwork_url = get_post_meta($post_id, '_artwork_url', true);
    if (!empty($artwork_url)) {
        update_post_meta($post_id, '_nft_artwork_url', sanitize_text_field($artwork_url));
    }

    // Creator Address
    $creator_address = get_post_meta($post_id, '_creator_address', true);
    if (!empty($creator_address)) {
        update_post_meta($post_id, '_nft_creator_address', sanitize_text_field($creator_address));
    }
}

